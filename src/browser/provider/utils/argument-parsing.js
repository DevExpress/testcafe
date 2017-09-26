import { find as findElement } from 'lodash';
import OS from 'os-family';


const CONFIG_TERMINATOR_RE     = /(\s+|^)-/;

export function hasMatch (array, re) {
    return !!findElement(array, el => el.match(re));
}

export function findMatch (array, re) {
    var element = findElement(array, el => el.match(re));

    return element ? element.match(re)[1] : '';
}

export function isMatchTrue (array, re) {
    var match = findMatch(array, re);

    return match && match !== '0' && match !== 'false';
}

export function splitEscaped (str, splitterChar) {
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

export function getPathFromParsedModes (modes, availableModes = []) {
    if (!modes.length)
        return '';

    if (availableModes.some(mode => mode === modes[0]))
        return '';

    var path = modes.shift();

    if (OS.win && modes.length && path.match(/^[A-Za-z]$/))
        path += ':' + modes.shift();

    return path;
}

export function getModes (modes, availableModes = []) {
    var result = {};

    availableModes = availableModes.slice();

    availableModes.forEach(key => {
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

export function parseConfig (str) {
    var configTerminatorMatch = str.match(CONFIG_TERMINATOR_RE);

    if (!configTerminatorMatch)
        return { modesString: str, userArgs: '' };

    return {
        modesString: str.substr(0, configTerminatorMatch.index),
        userArgs:    str.substr(configTerminatorMatch.index + configTerminatorMatch[1].length)
    };
}
