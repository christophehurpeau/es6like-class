esnext-class [![NPM version][npm-image]][npm-url] [![Build Status][build-status-image]][build-status-url] [![Coverage][coverage-image]][coverage-url]
============================

Write es6 like classes in es5 with a few more features

Cover some limitations to the current implementation of classes in es6:
- define properties
- use traits


## Use

```js
var newClass = require('esnext-class').newClass;

var A = newClass({
    constructor: function A(value) {
        this.initialized = value;
    }
});

var B = newClass({
    name: 'B',
    extends: A,

    constructor(value) {
        assert.strictEqual(this.constructor, B);
        this.bValue = value;
    }
});

```

## Class special properties

- `name`: set the name of the class
- `abstract`: set the class as abstract
- `constructor`: this is the constructor of the class, like the constructor function in es6 classes
- `extends`: extends a class from another or from an object
- `implements`: light checks over expected implementations and warn eventually when something is missing
- `prototype`
- `static`: define static properties in the class
- `with`: an array of traits, objects with properties


## Properties

Properties are defined in the prototype. If you want to set a property in the instance, use the constructor to do that.
If you want to define a property in the object, use `static`.

### Constant properties

You can set constant properties like this:

```
var A = newClass({
    name: 'A',
    constantProperty: newClass.const('myValue');
});

A.prototype.constantProperty = 'anotherValue'; // Error !
```

### Lazy properties

```
var A = newClass({
    name: 'A',
    lazyProperty: newClass.lazy(() => 'expensive result');
});


var a = new A();
console.log(a.lazyProperty); // the result of the function is set in `a.lazyProperty`

```

### Lazy constant properties

```
var A = newClass({
    name: 'A',
    lazyAndConstProperty: newClass.lazyConst(() => 'expensive result');
});


var a = new A();
console.log(a.lazyAndConstProperty); // the result of the function is set in `a.lazyProperty`
```

Note: both the prototype function and the instance property values are constants.

[build-status-image]: https://drone.io/github.com/christophehurpeau/esnext-class/status.png
[build-status-url]: https://drone.io/github.com/christophehurpeau/esnext-class/latest
[npm-image]: https://img.shields.io/npm/v/esnext-class.svg?style=flat
[npm-url]: https://npmjs.org/package/esnext-class
[coverage-image]: http://img.shields.io/badge/coverage-92%-green.svg?style=flat
[coverage-url]: http://christophehurpeau.github.io/esnext-class/coverage/lcov-report/lib/index.js.html
