'use strict';

exports.__esModule = true;
exports.default = delay;

var _pinkie = require('pinkie');

var _pinkie2 = _interopRequireDefault(_pinkie);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function delay(ms) {
    return new _pinkie2.default(function (resolve) {
        return setTimeout(resolve, ms);
    });
}
module.exports = exports['default'];