import { findMatch, isMatchTrue, splitEscaped, parseConfig, getModes, getPathFromParsedModes } from '../../../utils/argument-parsing';


const AVAILABLE_MODES = ['userProfile', 'headless'];

const configCache = {};

function hasCustomProfile (userArgs) {
    return !!(userArgs.match(/-P\s/) || userArgs.match(/-profile\s/));
}

function parseModes (modesStr, userArgs) {
    const parsed        = splitEscaped(modesStr, ':');
    const path          = getPathFromParsedModes(parsed, AVAILABLE_MODES);
    const detectedModes = getModes(parsed, AVAILABLE_MODES);
    const optionsString = parsed.filter(item => !!item).join(':');
    const options       = parsed.length ? splitEscaped(optionsString, ';') : [];

    return {
        path:                   path,
        userProfile:            detectedModes.userProfile || hasCustomProfile(userArgs),
        headless:               detectedModes.headless,
        marionettePort:         findMatch(options, /^marionettePort=(.*)/),
        disableMultiprocessing: isMatchTrue(options, /^disableMultiprocessing=(.*)/)
    };
}


function getNewConfig (configString) {
    const { userArgs, modesString } = parseConfig(configString);
    const modes                     = parseModes(modesString, userArgs);

    return Object.assign({ userArgs }, modes);
}

export default function (configString) {
    if (!configCache[configString])
        configCache[configString] = getNewConfig(configString);

    return configCache[configString];
}
