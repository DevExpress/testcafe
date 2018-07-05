'use strict';

exports.__esModule = true;

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _isNan = require('babel-runtime/core-js/number/is-nan');

var _isNan2 = _interopRequireDefault(_isNan);

exports.default = function (configString) {
    if (!configCache[configString]) configCache[configString] = getNewConfig(configString);

    return configCache[configString];
};

var _chromeEmulatedDevicesList = require('chrome-emulated-devices-list');

var _chromeEmulatedDevicesList2 = _interopRequireDefault(_chromeEmulatedDevicesList);

var _lodash = require('lodash');

var _argumentParsing = require('../../utils/argument-parsing');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var HEADLESS_DEFAULT_WIDTH = 1280;
var HEADLESS_DEFAULT_HEIGHT = 800;

var AVAILABLE_MODES = ['userProfile', 'headless', 'emulation'];

var configCache = {};

function hasCustomProfile(userArgs) {
    return !!userArgs.match(/--user-data-dir=/);
}

function parseModes(modesStr, userArgs) {
    var parsed = (0, _argumentParsing.splitEscaped)(modesStr, ':');
    var path = (0, _argumentParsing.getPathFromParsedModes)(parsed, AVAILABLE_MODES);
    var detectedModes = (0, _argumentParsing.getModes)(parsed, AVAILABLE_MODES);
    var optionsString = '';

    if (parsed.length) optionsString = parsed.shift();

    while (parsed.length) {
        optionsString += ':' + parsed.shift();
    }var modes = {
        path: path,
        userProfile: detectedModes.userProfile || hasCustomProfile(userArgs),
        headless: detectedModes.headless,
        emulation: detectedModes.emulation || detectedModes.headless
    };

    return { modes: modes, optionsString: optionsString };
}

function simplifyDeviceName(deviceName) {
    return deviceName.replace(/\s/g, '').toLowerCase();
}

function findDevice(deviceName) {
    var simpleName = simplifyDeviceName(deviceName);

    return _chromeEmulatedDevicesList2.default.filter(function (device) {
        return simplifyDeviceName(device.title).indexOf(simpleName) >= 0;
    })[0];
}

function getDeviceBasedOptions(deviceName, orientation) {
    if (!deviceName) return {};

    var deviceData = findDevice(deviceName);

    if (!deviceData) return {};

    var mobile = deviceData.capabilities.indexOf('mobile') >= 0;

    if (!orientation) orientation = mobile ? 'vertical' : 'horizontal';

    return {
        mobile: mobile,
        orientation: orientation,
        touch: deviceData.capabilities.indexOf('touch') >= 0,
        width: deviceData.screen[orientation].width,
        height: deviceData.screen[orientation].height,
        scaleFactor: deviceData.screen['device-pixel-ratio'],
        userAgent: deviceData['user-agent']
    };
}

function parseOptions(str, modes) {
    var parsed = (0, _argumentParsing.splitEscaped)(str, ';');

    var baseOptions = {
        width: modes.headless ? HEADLESS_DEFAULT_WIDTH : 0,
        height: modes.headless ? HEADLESS_DEFAULT_HEIGHT : 0,
        scaleFactor: 0,
        mobile: false,
        cdpPort: (0, _argumentParsing.findMatch)(parsed, /^cdpPort=(.*)/)
    };

    var deviceName = (0, _argumentParsing.findMatch)(parsed, /^device=(.*)/);
    var orientation = (0, _argumentParsing.findMatch)(parsed, /^orientation=(.*)/);
    var deviceBasedOptions = getDeviceBasedOptions(deviceName, orientation);

    var specifiedDeviceOptions = {
        orientation: orientation,
        touch: (0, _argumentParsing.hasMatch)(parsed, /^touch=/) ? (0, _argumentParsing.isMatchTrue)(parsed, /^touch=(.*)/) : void 0,
        mobile: (0, _argumentParsing.isMatchTrue)(parsed, /^mobile=(.*)/),
        width: Number((0, _argumentParsing.findMatch)(parsed, /^width=(.*)/) || NaN),
        height: Number((0, _argumentParsing.findMatch)(parsed, /^height=(.*)/) || NaN),
        scaleFactor: Number((0, _argumentParsing.findMatch)(parsed, /^scaleFactor=(.*)/) || NaN),
        userAgent: (0, _argumentParsing.findMatch)(parsed, /^userAgent=(.*)/)
    };

    specifiedDeviceOptions = (0, _lodash.pickBy)(specifiedDeviceOptions, function (optionValue) {
        return optionValue !== void 0 && optionValue !== '' && !(0, _isNan2.default)(optionValue);
    });

    return (0, _assign2.default)(baseOptions, deviceBasedOptions, specifiedDeviceOptions);
}

function getNewConfig(configString) {
    var _parseConfig = (0, _argumentParsing.parseConfig)(configString),
        userArgs = _parseConfig.userArgs,
        modesString = _parseConfig.modesString;

    var _parseModes = parseModes(modesString, userArgs),
        modes = _parseModes.modes,
        optionsString = _parseModes.optionsString;

    var options = parseOptions(optionsString, modes);

    return (0, _assign2.default)({ userArgs: userArgs }, modes, options);
}

module.exports = exports['default'];