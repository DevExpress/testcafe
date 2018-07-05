'use strict';

exports.__esModule = true;

exports.default = function () {
    var optionsStr = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

    var splittedOptions = optionsStr.split(OPTIONS_SEPARATOR);

    if (!splittedOptions.length) return null;

    var parsedOptions = {};

    splittedOptions.forEach(function (item) {
        var keyValuePair = item.split(OPTION_KEY_VALUE_SEPARATOR);
        var key = keyValuePair[0];
        var value = keyValuePair[1];

        if (!key || !value) return;

        value = convertToBestFitType(value);

        if (FILE_OPTION_NAMES.includes(key) && value.length < OS_MAX_PATH_LENGTH && _fs2.default.existsSync(value)) value = _fs2.default.readFileSync(value);

        parsedOptions[key] = value;
    });

    return parsedOptions;
};

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MAX_PATH_LENGTH = {
    'Linux': 4096,
    'Windows_NT': 260,
    'Darwin': 1024
};

var OS_MAX_PATH_LENGTH = MAX_PATH_LENGTH[_os2.default.type()];

var OPTIONS_SEPARATOR = ';';
var OPTION_KEY_VALUE_SEPARATOR = '=';
var FILE_OPTION_NAMES = ['cert', 'key', 'pfx'];
var NUMBER_REG_EX = /^[0-9-.,]+$/;
var BOOLEAN_STRING_VALUES = ['true', 'false'];

function convertToBestFitType(valueStr) {
    if (typeof valueStr !== 'string') return void 0;else if (NUMBER_REG_EX.test(valueStr)) return parseFloat(valueStr);else if (BOOLEAN_STRING_VALUES.includes(valueStr)) return valueStr === 'true';else if (!valueStr.length) return void 0;

    return valueStr;
}
module.exports = exports['default'];