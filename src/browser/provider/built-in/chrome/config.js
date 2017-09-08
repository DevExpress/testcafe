import emulatedDevices from 'chrome-emulated-devices-list';
import { pickBy as filterProperties } from 'lodash';
import {
    hasMatch, findMatch, isMatchTrue, getModes, splitEscaped, getPathFromParsedModes, parseConfig
} from '../../utils/argument-parsing';


const HEADLESS_DEFAULT_WIDTH  = 1280;
const HEADLESS_DEFAULT_HEIGHT = 800;

const AVAILABLE_MODES = ['userProfile', 'headless', 'emulation'];

var configCache = {};

function hasCustomProfile (userArgs) {
    return !!userArgs.match(/--user-data-dir=/);
}

function parseModes (modesStr, userArgs) {
    var parsed        = splitEscaped(modesStr, ':');
    var path          = getPathFromParsedModes(parsed, AVAILABLE_MODES);
    var detectedModes = getModes(parsed, AVAILABLE_MODES);
    var optionsString = '';

    if (parsed.length)
        optionsString = parsed.shift();

    while (parsed.length)
        optionsString += ':' + parsed.shift();

    var modes = {
        path:        path,
        userProfile: detectedModes.userProfile || hasCustomProfile(userArgs),
        headless:    detectedModes.headless,
        emulation:   detectedModes.emulation || detectedModes.headless
    };

    return { modes, optionsString };
}

function simplifyDeviceName (deviceName) {
    return deviceName.replace(/\s/g, '').toLowerCase();
}

function findDevice (deviceName) {
    var simpleName = simplifyDeviceName(deviceName);

    return emulatedDevices.filter(device => simplifyDeviceName(device.title).indexOf(simpleName) >= 0)[0];
}

function getDeviceBasedOptions (deviceName, orientation) {
    if (!deviceName)
        return {};

    var deviceData = findDevice(deviceName);

    if (!deviceData)
        return {};

    var mobile = deviceData.capabilities.indexOf('mobile') >= 0;

    if (!orientation)
        orientation = mobile ? 'vertical' : 'horizontal';

    return {
        mobile:      mobile,
        orientation: orientation,
        touch:       deviceData.capabilities.indexOf('touch') >= 0,
        width:       deviceData.screen[orientation].width,
        height:      deviceData.screen[orientation].height,
        scaleFactor: deviceData.screen['device-pixel-ratio'],
        userAgent:   deviceData['user-agent'],
    };
}

function parseOptions (str, modes) {
    var parsed = splitEscaped(str, ';');

    var baseOptions = {
        width:       modes.headless ? HEADLESS_DEFAULT_WIDTH : 0,
        height:      modes.headless ? HEADLESS_DEFAULT_HEIGHT : 0,
        scaleFactor: 0,
        mobile:      false,
        cdpPort:     findMatch(parsed, /^cdpPort=(.*)/)
    };

    var deviceName         = findMatch(parsed, /^device=(.*)/);
    var orientation        = findMatch(parsed, /^orientation=(.*)/);
    var deviceBasedOptions = getDeviceBasedOptions(deviceName, orientation);

    var specifiedDeviceOptions = {
        orientation: orientation,
        touch:       hasMatch(parsed, /^touch=/) ? isMatchTrue(parsed, /^touch=(.*)/) : void 0,
        mobile:      isMatchTrue(parsed, /^mobile=(.*)/),
        width:       Number(findMatch(parsed, /^width=(.*)/) || NaN),
        height:      Number(findMatch(parsed, /^height=(.*)/) || NaN),
        scaleFactor: Number(findMatch(parsed, /^scaleFactor=(.*)/) || NaN),
        userAgent:   findMatch(parsed, /^userAgent=(.*)/)
    };

    specifiedDeviceOptions = filterProperties(specifiedDeviceOptions, optionValue => {
        return optionValue !== void 0 && optionValue !== '' && !Number.isNaN(optionValue);
    });

    return Object.assign(baseOptions, deviceBasedOptions, specifiedDeviceOptions);
}


function getNewConfig (configString) {
    var { userArgs, modesString } = parseConfig(configString);
    var { modes, optionsString }  = parseModes(modesString, userArgs);
    var options                   = parseOptions(optionsString, modes);

    return Object.assign({ userArgs }, modes, options);
}

export default function (configString) {
    if (!configCache[configString])
        configCache[configString] = getNewConfig(configString);

    return configCache[configString];
}
