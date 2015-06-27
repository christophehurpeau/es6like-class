/* global test */
'use strict';

var assert = require('proclaim');
var lib = '../../lib' + (process.env.TEST_COV && '-cov' || '') + '/';

var message = '';
console.warn = function (warning) {
    message += warning;
};

var newClass = require(lib).newClass;

test('check if Class is a function', function () {
    assert.isFunction(newClass);
});

test('check the constructor', function () {
    var A = newClass({
        constructor: function A() {
            assert.strictEqual(this.constructor, A);
        }
    });

    new A();
});

test('constructor name', function () {
    var B = newClass({ name: 'B' });
    assert.strictEqual(B.name, 'B');
    assert.strictEqual(B.prototype.name, undefined);
});

test('constructor is not defined', function () {
    var B = newClass({});
    assert.strictEqual(new B().constructor, B);
});

test('extends classes', function () {
    var A = newClass({ hello: true });
    var B = newClass({ 'extends': A });

    var b = new B();
    assert.strictEqual(b.hello, true);
    assert.notOk(B.prototype.hasOwnProperty('extends'));
});

test('extends constructor', function () {
    var A = newClass({
        constructor: function A(value) {
            this.initialized = value;
        }
    });

    var B = newClass({
        'extends': A
    });

    var b = new B(123);
    assert.strictEqual(b.initialized, 123);
});

test('extends with defined constructor', function () {
    var A = newClass({
        constructor: function A(value) {
            this.initialized = value;
        }
    });

    var B = newClass({
        'extends': A,

        constructor: function B(value) {
            assert.strictEqual(this.constructor, B);
            this.bValue = value;
        }
    });

    var b = new B(123);
    assert.strictEqual(b.initialized, undefined);
    assert.strictEqual(b.bValue, 123);
});

test('extends isInstanceOf', function () {
    var A = newClass({
        constructor: function A() {}
    });

    var B = newClass({
        'extends': A
    });

    var C = newClass({
        'extends': B
    });

    assert.isInstanceOf(new A(), A);
    assert.isNotInstanceOf(new A(), B);
    assert.isNotInstanceOf(new A(), C);

    assert.isInstanceOf(new B(), A);
    assert.isInstanceOf(new B(), B);
    assert.isNotInstanceOf(new B(), C);

    assert.isInstanceOf(new C(), A);
    assert.isInstanceOf(new C(), B);
    assert.isInstanceOf(new C(), C);
});

test('static properties', function () {
    var A = newClass({
        'static': {
            a: 1
        }
    });

    var B = newClass({
        'extends': A,
        'static': {
            b: 2
        }
    });

    assert.strictEqual(A.a, 1);
    assert.strictEqual(A.b, undefined);

    assert.ok(A.hasOwnProperty('a'));
    assert.notOk(A.hasOwnProperty('b'));
    assert.notOk(A.prototype.hasOwnProperty('a'));
    assert.notOk(A.prototype.hasOwnProperty('static'));

    assert.strictEqual(B.a, 1);
    assert.strictEqual(B.b, 2);
    assert.ok(B.hasOwnProperty('a'));
    assert.ok(B.hasOwnProperty('b'));
    assert.notOk(B.prototype.hasOwnProperty('a'));
    assert.notOk(B.prototype.hasOwnProperty('b'));
});

test('class toString method', function () {
    var A = newClass({
        toString: function toString() {
            return 'a';
        }
    });
    assert.strictEqual('' + new A(), 'a');
});

test('class static and property', function () {
    var A = newClass({
        'static': {
            A: 'staticValue'
        },
        A: 'instanceValue'
    });

    var a = new A();
    assert.strictEqual(A.A, 'staticValue');
    assert.strictEqual(a.A, 'instanceValue');
});

test('class lazy property', function () {
    var lazyPropertyCalled = false;
    var A = newClass({
        a: newClass.lazy(function () {
            lazyPropertyCalled = true;
            return 42;
        })
    });

    var a = new A();
    assert.isFalse(lazyPropertyCalled);
    assert.strictEqual(a.a, 42);
    assert.isTrue(lazyPropertyCalled);
    lazyPropertyCalled = false;
    assert.strictEqual(a.a, 42);
    assert.isFalse(lazyPropertyCalled);
});

test('class const property', function () {
    var A = newClass({
        a: 42
    });

    var B = newClass({
        b: newClass['const'](42)
    });

    Object.defineProperty(A.prototype, 'a', {
        writable: false,
        configurable: true,
        enumerable: false,
        value: false
    });

    assert.isFalse(A.prototype.a);

    assert.throws(function () {
        return Object.defineProperty(B.prototype, 'b', {
            writable: false,
            configurable: true,
            enumerable: false,
            value: false
        });
    }, 'Cannot redefine property: b');

    assert.strictEqual(B.prototype.b, 42);
});

test('class lazy const property', function () {
    var lazyPropertyCalled = false;
    var A = newClass({
        a: newClass.lazy(function () {
            lazyPropertyCalled = true;
            return 42;
        })
    });

    var a = new A();
    assert.isFalse(lazyPropertyCalled);
    assert.strictEqual(a.a, 42);
    assert.isTrue(lazyPropertyCalled);
    lazyPropertyCalled = false;
    assert.strictEqual(a.a, 42);
    assert.isFalse(lazyPropertyCalled);

    assert.throws(function () {
        return Object.defineProperty(A.prototype, 'a', {
            writable: false,
            configurable: true,
            enumerable: false,
            value: false
        });
    }, 'Cannot redefine property: a');
});

test('class static override', function () {
    var A = newClass({
        'static': {
            hello: 'aValue'
        }
    });

    var B = newClass({
        'extends': A,
        'static': {
            hello: 'bValue'
        }
    });

    assert.strictEqual(A.hello, 'aValue');
    assert.strictEqual(B.hello, 'bValue');
});

test('class extends object', function () {
    var a = { a: 1 };
    var B = newClass({
        'extends': a,
        b: 2
    });

    var b = new B();

    assert.strictEqual(b.a, 1);
    assert.strictEqual(b.b, 2);
    assert.strictEqual(B.a, undefined);
    assert.strictEqual(a.b, undefined);
});

test('class mixin', function () {
    var sequence = [];
    var A = newClass({
        'with': {
            init: function init() {
                sequence.push('A#mixin');
            }
        },
        constructor: function constructor() {
            sequence.push('A#constructor');
        }
    });
    var B = newClass({
        'extends': A,
        'with': {
            init: function init() {
                sequence.push('B#mixin');
            }
        },
        constructor: function constructor() {
            sequence.push('B#constructor');
            A.call(this);
        }
    });
    var C = {
        init: function init() {
            sequence.push('C#mixin');
        }
    };
    var D = {
        init: function init() {
            sequence.push('D#mixin');
        }
    };
    var E = newClass({
        'extends': B,
        'with': [C, D],
        constructor: function constructor() {
            sequence.push('C#constructor');
            B.call(this);
        }
    });
    new E();
    assert.equal(sequence.join(','), ['C#mixin', 'D#mixin', 'C#constructor', 'B#mixin', 'B#constructor', 'A#mixin', 'A#constructor'].join(','));
});

test('class warning on duplicate', function () {
    message = '';
    newClass({
        'with': [{ a: 1 }, { a: 2 }]
    });
    assert.equal(message, 'duplicated: a');
});

test('class implements', function () {
    message = '';
    var A = newClass({
        'implements': {
            method1: function method1() {},

            method2: function method2() {}
        },
        method2: function method2() {}
    });
    assert.equal(message, 'method1 is not implemented');

    message = '';
    var B = newClass({
        'extends': A
    });

    message = '';
    newClass({
        'extends': B,
        'implements': [{ a: Object }, { b: Object }],
        a: Object
    });

    assert.equal(message, ['b is not implemented'].join(''));
});
//# sourceMappingURL=test.js.map