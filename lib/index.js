/*! heavily inspired from Andrea Giammarchi - https://github.com/WebReflection/es-class */
/* jshint evil: true */

// verifies a key is not special for the class
"use strict";

var specialKeys = "abstract constructor extends implements prototype static with".split(" ");
var isNotASpecialKey = function isNotASpecialKey(key, allowInit) {
    return specialKeys.indexOf(key) === -1;
};

var warn = console.warn || function () {};

// configure enumerable source properties in the target
var copyProperties = function copyProperties(source, target, allowInit) {
    var sourceIsFunction = typeof source === "function";
    Object.getOwnPropertyNames(source).forEach(function (key) {
        if (sourceIsFunction && ["name", "displayName", "arguments", "caller", "length"].indexOf(key) !== -1) {
            return;
        }
        if (isNotASpecialKey(key) && (allowInit || key !== "init")) {
            if (target.hasOwnProperty(key)) {
                warn("duplicated: " + key);
            } else {
                var descriptor = Object.getOwnPropertyDescriptor(source, key);
                var isConst = key.startsWith("const_");
                var isLazy = key.startsWith("lazyProperty_");
                var targetKey, lazyPropertyComputer;
                if (isConst) {
                    targetKey = key.substr("const_".length);
                } else if (isLazy) {
                    lazyPropertyComputer = descriptor.value || descriptor.get;
                    targetKey = key.substr("lazyProperty_".length);
                } else {
                    targetKey = key;
                }

                Object.defineProperty(target, targetKey, descriptor.get || descriptor.set || isLazy ? {
                    enumerable: false,
                    get: !isLazy ? descriptor.get : function () {
                        Object.defineProperty(this, targetKey, {
                            writable: false,
                            configurable: false,
                            enumerable: false,
                            value: lazyPropertyComputer()
                        });
                    },
                    set: descriptor.set
                } : {
                    writable: false,
                    configurable: !isConst,
                    enumerable: false,
                    value: descriptor.value
                });
            }
        }
    });
};

// copy all imported enumerable methods and properties
var addMixins = function addMixins(mixins, target, inherits) {
    var init = [];
    mixins.forEach(function (mixin) {
        if (mixin.hasOwnProperty("init")) {
            init.push(mixin.init);
        }
        copyProperties(mixin, target, false);
    });
    return init;
};

// basic check against expected properties or methods
var verifyImplementations = function verifyImplementations(interfaces, target) {
    interfaces.forEach(function (_interface) {
        Object.keys(_interface).forEach(function (key) {
            if (!target.hasOwnProperty(key)) {
                warn(key + " is not implemented");
            }
        });
    });
};

exports.newClass = function newClass(description) {
    var hasConstructor = description.hasOwnProperty("constructor");
    var hasName = description.hasOwnProperty("name");
    var hasParent = description.hasOwnProperty("extends");
    var parent = description["extends"];
    var hasParentPrototype = hasParent && typeof parent === "function";
    var inherits = hasParentPrototype ? parent.prototype : parent;
    var constructor = description.constructor;
    if (!hasConstructor) {
        if (hasParent && hasParentPrototype) {
            constructor = function Class() {
                return parent.apply(this, arguments);
            };
        } else {
            constructor = function Class() {};
        }
    } else {
        if (!constructor) {
            throw new Error("Invalid function constructor");
        }
    }
    if (hasName && constructor.name !== description.name) {
        try {
            Object.defineProperty(constructor, "name", {
                value: description.name,
                writable: false,
                enumerable: false
            });
            Object.defineProperty(constructor, "displayName", {
                value: description.name,
                writable: false,
                enumerable: false
            });
        } catch (e) {
            var fnCreator = new Function("init", "return function " + description.name + "(){return init.apply(this,arguments);}");
            constructor = fnCreator(constructor);
        }
    }

    var prototype = hasParent ? Object.create(inherits) : constructor.prototype;

    if (!prototype) {
        throw new Error("Invalid function constructor: invalid prototype");
    }

    // add modules/mixins (that might swap the constructor)
    if (description.hasOwnProperty("with")) {
        var mixins = addMixins([].concat(description["with"]), prototype, inherits);
        if (mixins.length) {
            constructor = (function (parent) {
                return function () {
                    var _this = this;

                    mixins.forEach(function (mixin) {
                        mixin.call(_this);
                    });
                    return parent.apply(this, arguments);
                };
            })(constructor);
        }
    }

    constructor.prototype = prototype;

    if (description.hasOwnProperty("static")) {
        // add public static properties
        copyProperties(description["static"], constructor, true);
    }

    if (hasParent) {
        // in case it's a function
        if (parent !== inherits) {
            // copy possibly inherited statics too
            copyProperties(parent, constructor, true);
        }
        constructor.prototype = prototype;
    }

    if (prototype.constructor !== constructor) {
        Object.defineProperty(prototype, "constructor", {
            writable: true,
            configurable: true,
            enumerable: false,
            value: constructor
        });
    }

    // enrich the prototype
    copyProperties(description, prototype, true);

    if (description.hasOwnProperty("implements")) {
        verifyImplementations([].concat(description["implements"]), prototype);
    }

    return constructor;
};
//# sourceMappingURL=index.js.map