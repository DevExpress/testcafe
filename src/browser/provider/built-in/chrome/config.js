import emulatedDevices from 'chrome-emulated-devices-list';
import OS from 'os-family';
import { find as findElement, pickBy as filterProperties } from 'lodash';


const CONFIG_TERMINATOR_RE = /(\s+|^)-/;

var configCache = {};

function hasMatch (array, re) {
    return !!findElement(array, el => el.match(re));
}

function findMatch (array, re) {
    var element = findElement(array, el => el.match(re));

    return element ? element.match(re)[1] : '';
}

function isMatchTrue (array, re) {
    var match = findMatch(array, re);

    return match && match !== '0' && match !== 'false';
}

function splitEscaped (str, splitterChar) {
    var result = [''];

    for (var i = 0; i < str.length; i++) {
        if (str[i] === splitterChar) {
            result.push('');
            continue;
        }

        if (str[i] === '\\' && (str[i + 1] === '\\' || str [i + 1] === splitterChar))
            i++;

        result[result.length - 1] += str[i];
    }

    return result;
}

function parseConfig (str) {
    var configTerminatorMatch = str.match(CONFIG_TERMINATOR_RE);

    if (!configTerminatorMatch)
        return { modesString: str, userArgs: '' };

    return {
        modesString: str.substr(0, configTerminatorMatch.index),
        userArgs:    str.substr(configTerminatorMatch.index + configTerminatorMatch[1].length)
    };
}

function getPathFromParsedModes (modesList) {
    if (!modesList.length)
        return '';

    if (modesList[0] === 'headless' || modesList[0] === 'emulation')
        return '';

    var path = modesList.shift();

    if (OS.win && modesList.length && path.match(/^[A-Za-z]$/))
        path += ':' + modesList.shift();

    return path;
}

function parseModes (str) {
    var parsed      = splitEscaped(str, ':');
    var path        = getPathFromParsedModes(parsed);
    var nextMode    = parsed.shift();
    var hasHeadless = nextMode === 'headless';

    if (hasHeadless)
        nextMode = parsed.shift();

    var hasEmulation = nextMode === 'emulation';

    if (hasEmulation)
        nextMode = parsed.shift();

    while (parsed.length)
        nextMode += ':' + parsed.shift();

    var modes = {
        path:      path,
        headless:  hasHeadless,
        emulation: hasEmulation || hasHeadless
    };

    return { modes, optionsString: nextMode || '' };
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

function parseOptions (str) {
    var parsed = splitEscaped(str, ';');

    var baseOptions = {
        width:       0,
        height:      0,
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
        userAgent:   findMatch(parsed, /^userAgent=(.*)/),
    };

    specifiedDeviceOptions = filterProperties(specifiedDeviceOptions, optionValue => {
        return optionValue !== void 0 && optionValue !== '' && !Number.isNaN(optionValue);
    });

    return Object.assign(baseOptions, deviceBasedOptions, specifiedDeviceOptions);
}


function getNewConfig (configString) {
    var { userArgs, modesString } = parseConfig(configString);
    var { modes, optionsString }  = parseModes(modesString);
    var options                   = parseOptions(optionsString);

    return Object.assign({ userArgs }, modes, options);
}

export default function (configString) {
    if (!configCache[configString])
        configCache[configString] = getNewConfig(configString);

    return configCache[configString];
}
