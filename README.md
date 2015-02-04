es6like-class [![NPM version][npm-image]][npm-url] [![Build Status][build-status-image]][build-status-url] [![Coverage][coverage-image]][coverage-url]
============================

Write es6 like classes in es5 with a few more features

Cover some limitations to the current implementation of classes in es6:
- define properties
- use traits


## Use

```js
var newClass = require('es6like-class').newClass;

var A = newClass({
    constructor: function A(value) {
        this.initialized = value;
    }
});

var B = newClass({
    extends: A,

    constructor: function B(value) {
        assert.strictEqual(this.constructor, B);
        this.bValue = value;
    }
});

```

## Class special properties

- abstract: set the class as abstract
- constructor: this is the constructor of the class, like the constructor function in es6 classes
- extends: extends a class from another or from an object
- implements: light checks over expected implementations and warn eventually when something is missing
- prototype
- static: define static properties in the class
- with: an array of traits, objects with properties

[build-status-image]: https://drone.io/github.com/christophehurpeau/es6like-class/status.png
[build-status-url]: https://drone.io/github.com/christophehurpeau/es6like-class/latest
[npm-image]: https://img.shields.io/npm/v/es6like-class.svg?style=flat
[npm-url]: https://npmjs.org/package/es6like-class
[coverage-image]: http://img.shields.io/badge/coverage-89%-green.svg?style=flat
[coverage-url]: http://christophehurpeau.github.io/es6like-class/docs/coverage.html
