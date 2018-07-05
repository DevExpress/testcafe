'use strict';

exports.__esModule = true;

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

exports.default = function (configString) {
    if (!configCache[configString]) configCache[configString] = getNewConfig(configString);

    return configCache[configString];
};

var _argumentParsing = require('../../utils/argument-parsing');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var AVAILABLE_MODES = ['userProfile', 'headless'];

var configCache = {};

function hasCustomProfile(userArgs) {
    return !!(userArgs.match(/-P\s/) || userArgs.match(/-profile\s/));
}

function parseModes(modesStr, userArgs) {
    var parsed = (0, _argumentParsing.splitEscaped)(modesStr, ':');
    var path = (0, _argumentParsing.getPathFromParsedModes)(parsed, AVAILABLE_MODES);
    var detectedModes = (0, _argumentParsing.getModes)(parsed, AVAILABLE_MODES);
    var optionsString = parsed.filter(function (item) {
        return !!item;
    }).join(':');
    var options = parsed.length ? (0, _argumentParsing.splitEscaped)(optionsString, ';') : [];

    return {
        path: path,
        userProfile: detectedModes.userProfile || hasCustomProfile(userArgs),
        headless: detectedModes.headless,
        marionettePort: (0, _argumentParsing.findMatch)(options, /^marionettePort=(.*)/),
        disableMultiprocessing: (0, _argumentParsing.isMatchTrue)(options, /^disableMultiprocessing=(.*)/)
    };
}

function getNewConfig(configString) {
    var _parseConfig = (0, _argumentParsing.parseConfig)(configString),
        userArgs = _parseConfig.userArgs,
        modesString = _parseConfig.modesString;

    var modes = parseModes(modesString, userArgs);

    return (0, _assign2.default)({ userArgs: userArgs }, modes);
}

module.exports = exports['default'];