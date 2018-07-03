'use strict';

exports.__esModule = true;
exports.hasMatch = hasMatch;
exports.findMatch = findMatch;
exports.isMatchTrue = isMatchTrue;
exports.splitEscaped = splitEscaped;
exports.getPathFromParsedModes = getPathFromParsedModes;
exports.getModes = getModes;
exports.parseConfig = parseConfig;

var _lodash = require('lodash');

var _osFamily = require('os-family');

var _osFamily2 = _interopRequireDefault(_osFamily);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CONFIG_TERMINATOR_RE = /(\s+|^)-/;

function hasMatch(array, re) {
    return !!(0, _lodash.find)(array, function (el) {
        return el.match(re);
    });
}

function findMatch(array, re) {
    var element = (0, _lodash.find)(array, function (el) {
        return el.match(re);
    });

    return element ? element.match(re)[1] : '';
}

function isMatchTrue(array, re) {
    var match = findMatch(array, re);

    return match && match !== '0' && match !== 'false';
}

function splitEscaped(str, splitterChar) {
    var result = [''];

    for (var i = 0; i < str.length; i++) {
        if (str[i] === splitterChar) {
            result.push('');
            continue;
        }

        if (str[i] === '\\' && (str[i + 1] === '\\' || str[i + 1] === splitterChar)) i++;

        result[result.length - 1] += str[i];
    }

    return result;
}

function getPathFromParsedModes(modes) {
    var availableModes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

    if (!modes.length) return '';

    if (availableModes.some(function (mode) {
        return mode === modes[0];
    })) return '';

    var path = modes.shift();

    if (_osFamily2.default.win && modes.length && path.match(/^[A-Za-z]$/)) path += ':' + modes.shift();

    return path;
}

function getModes(modes) {
    var availableModes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

    var result = {};

    availableModes = availableModes.slice();

    availableModes.forEach(function (key) {
        result[key] = false;
    });

    while (modes.length && availableModes.length) {
        if (modes[0] === availableModes[0]) {
            result[availableModes[0]] = true;

            modes.shift();
        }

        availableModes.shift();
    }

    return result;
}

function parseConfig(str) {
    var configTerminatorMatch = str.match(CONFIG_TERMINATOR_RE);

    if (!configTerminatorMatch) return { modesString: str, userArgs: '' };

    return {
        modesString: str.substr(0, configTerminatorMatch.index),
        userArgs: str.substr(configTerminatorMatch.index + configTerminatorMatch[1].length)
    };
}