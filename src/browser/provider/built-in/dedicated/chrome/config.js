import emulatedDevices from 'chrome-emulated-devices-list';
import { pickBy as filterProperties, camelCase } from 'lodash';
import {
    hasMatch, findMatch, isMatchTrue, getModes, splitEscaped, getPathFromParsedModes, parseConfig
} from '../../../utils/argument-parsing';


const HEADLESS_DEFAULT_WIDTH  = 1280;
const HEADLESS_DEFAULT_HEIGHT = 800;

const AVAILABLE_MODES = ['userProfile', 'headless', 'emulation'];

const configCache = {};

function parseUserArgs (userArgs) {
    const parsedArgs = {
        headless:    false,
        userDataDir: false,
        windowSize:  false
    };

    const splittedArgs = userArgs.split(' ').filter(arg => !!arg);

    splittedArgs.forEach(arg => {
        const keyValuePair = arg.split('=');
        const key          = camelCase(keyValuePair[0]);

        parsedArgs[key] = parsedArgs[key] !== void 0;
    });

    return parsedArgs;
}

function parseModes (modesStr, userArgs) {
    const parsed        = splitEscaped(modesStr, ':');
    const path          = getPathFromParsedModes(parsed, AVAILABLE_MODES);
    const detectedModes = getModes(parsed, AVAILABLE_MODES);
    let optionsString = '';

    if (parsed.length)
        optionsString = parsed.shift();

    while (parsed.length)
        optionsString += ':' + parsed.shift();

    const userProfile = detectedModes.userProfile || userArgs.userDataDir;
    const headless    = detectedModes.headless || userArgs.headless;
    const emulation   = detectedModes.emulation || headless;

    const modes = {
        path,
        userProfile,
        headless,
        emulation
    };

    return { modes, optionsString };
}

function simplifyDeviceName (deviceName) {
    return deviceName.replace(/\s/g, '').toLowerCase();
}

function findDevice (deviceName) {
    const simpleName = simplifyDeviceName(deviceName);

    return emulatedDevices.filter(device => simplifyDeviceName(device.title).indexOf(simpleName) >= 0)[0];
}

function getDeviceBasedOptions (deviceName, orientation) {
    if (!deviceName)
        return {};

    const deviceData = findDevice(deviceName);

    if (!deviceData)
        return {};

    const mobile = deviceData.capabilities.indexOf('mobile') >= 0;

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

function parseOptions (str, useDefaultDimensions) {
    const parsed = splitEscaped(str, ';');

    const baseOptions = {
        width:       useDefaultDimensions ? HEADLESS_DEFAULT_WIDTH : 0,
        height:      useDefaultDimensions ? HEADLESS_DEFAULT_HEIGHT : 0,
        scaleFactor: 0,
        mobile:      false,
        cdpPort:     findMatch(parsed, /^cdpPort=(.*)/)
    };

    const deviceName         = findMatch(parsed, /^device=(.*)/);
    const orientation        = findMatch(parsed, /^orientation=(.*)/);
    const deviceBasedOptions = getDeviceBasedOptions(deviceName, orientation);

    let specifiedDeviceOptions = {
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
    const { userArgs, modesString } = parseConfig(configString);
    const parsedUserArgs            = parseUserArgs(userArgs);
    const { modes, optionsString }  = parseModes(modesString, parsedUserArgs);
    const useDefaultDimensions      = modes.headless && !parsedUserArgs.windowSize;
    const options                   = parseOptions(optionsString, useDefaultDimensions);

    return Object.assign({ userArgs }, modes, options);
}

export default function (configString) {
    if (!configCache[configString])
        configCache[configString] = getNewConfig(configString);

    return configCache[configString];
}
