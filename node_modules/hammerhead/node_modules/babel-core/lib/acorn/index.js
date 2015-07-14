"use strict";

exports.__esModule = true;

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

require("./plugins/flow");

var _acornJsxInject = require("acorn-jsx/inject");

var _acornJsxInject2 = _interopRequireDefault(_acornJsxInject);

var _srcIndex = require("./src/index");

var acorn = _interopRequireWildcard(_srcIndex);

_defaults(exports, _interopRequireWildcard(_srcIndex));

(0, _acornJsxInject2["default"])(acorn);