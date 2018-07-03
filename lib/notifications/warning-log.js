'use strict';

exports.__esModule = true;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _renderTemplate = require('../utils/render-template');

var _renderTemplate2 = _interopRequireDefault(_renderTemplate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var WarningLog = function () {
    function WarningLog() {
        (0, _classCallCheck3.default)(this, WarningLog);

        this.messages = [];
    }

    WarningLog.prototype.addWarning = function addWarning() {
        var msg = _renderTemplate2.default.apply(null, arguments);

        // NOTE: avoid duplicates
        if (this.messages.indexOf(msg) < 0) this.messages.push(msg);
    };

    return WarningLog;
}();

exports.default = WarningLog;
module.exports = exports['default'];