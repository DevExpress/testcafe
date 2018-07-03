'use strict';

exports.__esModule = true;
exports.default = showDeprecationMessage;

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _callsiteRecord = require('callsite-record');

var _createStackFilter = require('../errors/create-stack-filter');

var _createStackFilter2 = _interopRequireDefault(_createStackFilter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function showDeprecationMessage(callsite, info) {
    var callsiteStr = '';

    if (callsite) {
        callsiteStr = callsite.renderSync({
            renderer: _callsiteRecord.renderers.noColor,
            stackFilter: (0, _createStackFilter2.default)(Error.stackTraceLimit)
        });
    }

    /* eslint-disable no-console */
    console.error(_chalk2.default.yellow('\n----'));
    console.error(_chalk2.default.yellow('DEPRECATION-WARNING: ' + info.what + ' was deprecated and will be removed in future releases.'));
    console.error(_chalk2.default.yellow('Use ' + info.useInstead + ' instead.'));
    console.error(_chalk2.default.yellow('See https://devexpress.github.io/testcafe/documentation for more info.'));
    console.error(_chalk2.default.yellow(callsiteStr));
    console.error(_chalk2.default.yellow('----\n'));
    /* eslint-enable no-console */
}
module.exports = exports['default'];