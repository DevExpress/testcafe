"use strict";

exports.__esModule = true;

var _defineProperty = require("babel-runtime/core-js/object/define-property");

var _defineProperty2 = _interopRequireDefault(_defineProperty);

exports.default = defineLazyProperty;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function defineLazyProperty(obj, propName, initializer) {
    (0, _defineProperty2.default)(obj, propName, {
        propValue: null,

        get: function get() {
            if (!this.propValue) this.propValue = initializer();

            return this.propValue;
        }
    });
}
module.exports = exports["default"];