'use strict';

exports.__esModule = true;

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _assignable = require('../utils/assignable');

var _assignable2 = _interopRequireDefault(_assignable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var BrowserConsoleMessages = function (_Assignable) {
    (0, _inherits3.default)(BrowserConsoleMessages, _Assignable);

    function BrowserConsoleMessages(obj) {
        (0, _classCallCheck3.default)(this, BrowserConsoleMessages);

        var _this = (0, _possibleConstructorReturn3.default)(this, _Assignable.call(this));

        _this.log = [];
        _this.info = [];
        _this.warn = [];
        _this.error = [];

        _this._assignFrom(obj);
        return _this;
    }

    BrowserConsoleMessages.prototype._getAssignableProperties = function _getAssignableProperties() {
        return [{ name: 'log' }, { name: 'info' }, { name: 'warn' }, { name: 'error' }];
    };

    BrowserConsoleMessages.prototype.concat = function concat(consoleMessages) {
        this.log = this.log.concat(consoleMessages.log);
        this.info = this.info.concat(consoleMessages.info);
        this.warn = this.warn.concat(consoleMessages.warn);
        this.error = this.error.concat(consoleMessages.error);
    };

    BrowserConsoleMessages.prototype.addMessage = function addMessage(type, msg) {
        this[type].push(msg);
    };

    BrowserConsoleMessages.prototype.getCopy = function getCopy() {
        var copy = {};
        var properties = this._getAssignableProperties();

        for (var _iterator = properties, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : (0, _getIterator3.default)(_iterator);;) {
            var _ref;

            if (_isArray) {
                if (_i >= _iterator.length) break;
                _ref = _iterator[_i++];
            } else {
                _i = _iterator.next();
                if (_i.done) break;
                _ref = _i.value;
            }

            var property = _ref;

            copy[property.name] = this[property.name].slice();
        }return copy;
    };

    return BrowserConsoleMessages;
}(_assignable2.default); // -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------


exports.default = BrowserConsoleMessages;
module.exports = exports['default'];