import { findMatch, splitEscaped, parseConfig, getModes, getPathFromParsedModes } from '../../utils/argument-parsing';


const AVAILABLE_MODES = ['userProfile', 'headless'];

var configCache = {};

function hasCustomProfile (userArgs) {
    return !!(userArgs.match(/-P\s/) || userArgs.match(/-profile\s/));
}

function parseModes (modesStr, userArgs) {
    var parsed        = splitEscaped(modesStr, ':');
    var path          = getPathFromParsedModes(parsed, AVAILABLE_MODES);
    var detectedModes = getModes(parsed, AVAILABLE_MODES);

    return {
        path:           path,
        userProfile:    detectedModes.userProfile || hasCustomProfile(userArgs),
        headless:       detectedModes.headless,
        marionettePort: findMatch(parsed, /^marionettePort=(.*)/)
    };
}


function getNewConfig (configString) {
    var { userArgs, modesString } = parseConfig(configString);
    var modes                     = parseModes(modesString, userArgs);

    return Object.assign({ userArgs }, modes);
}

export default function (configString) {
    if (!configCache[configString])
        configCache[configString] = getNewConfig(configString);

    return configCache[configString];
}
