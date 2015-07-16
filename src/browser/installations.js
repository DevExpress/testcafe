import fs from 'fs';
import childProcess from 'child_process';
import Promise from 'promise';
import OS from '../utils/os';

// Const
const ALIASES = {
    'ie': {
        nameRe: /ie|internet explorer/i,
        cmd:    ''
    },

    'ff': {
        nameRe: /firefox|mozilla/i,
        cmd:    '-new-window'
    },

    'chrome': {
        nameRe: /chrome/i,
        cmd:    '--new-window'
    },

    'chromium': {
        nameRe: /chromium/i,
        cmd:    '--new-window'
    },

    'opera': {
        nameRe: /opera/i,
        cmd:    '--new-window'
    },

    'safari': {
        nameRe: /safari/i,
        cmd:    ''
    }
};


// Installation info cache
var installationsCache = null;


// Promisified node API
var exec = Promise.denodeify(childProcess.exec);

function exists (path) {
    return new Promise(resolve => fs.exists(path, resolve));
}


// Find installations for different platforms
async function addInstallation (installations, name, path) {
    var fileExists = await exists(path);

    if (fileExists) {
        Object.keys(ALIASES).some((alias) => {
            var { nameRe, cmd } = ALIASES[alias];

            if (nameRe.test(name)) {
                installations[alias] = { path, cmd };
                return true;
            }

            return false;
        });
    }
}

async function findWindowsBrowsers () {
    var installations = {};
    var regKey        = 'HKEY_LOCAL_MACHINE\\SOFTWARE\\Clients\\StartMenuInternet\\';
    var regKeyEsc     = regKey.replace(/\\/g, '\\\\');
    var browserRe     = new RegExp(regKeyEsc + '([^\\\\]+)\\\\shell\\\\open\\\\command' +
                                   '\\s+\\([^)]+\\)\\s+reg_sz\\s+([^\n]+)\n', 'gi');

    var stdout = await exec(`chcp 65001 | reg query ${regKey} /s`);

    for (var match = browserRe.exec(stdout); match; match = browserRe.exec(stdout)) {
        var name = match[1].replace(/\.exe$/gi, '');

        var path = match[2]
            .replace(/"/g, '')
            .replace(/\\$/, '')
            .replace(/\s*$/, '');

        await addInstallation(installations, name, path);
    }

    return installations;
}

async function findMacBrowsers () {
    var installations = {};

    //NOTE: replace space symbol with the code, because grep splits strings by space.
    var stdout = await exec('ls "/Applications/" | grep -E "Chrome|Firefox|Opera|Safari|Chromium" | sed -E "s/ /032/"');

    await * stdout
        .split('\n')
        .filter(fileName => !!fileName)
        .map(fileName => {
            //NOTE: restore space
            fileName = fileName.replace(/032/g, ' ');

            var name = fileName.replace(/.app$/, '');
            var path = `/Applications/${fileName}`;

            return addInstallation(installations, name, path);
        });

    return installations;
}

async function findLinuxBrowsers () {
    var installations = {};
    var stdout        = await exec('update-alternatives --list x-www-browser');

    await * stdout
        .split('\n')
        .map(path => {
            var name = path.replace(/.*\/([^\/]+)$/g, '$1');

            return addInstallation(installations, name, path);
        });

    return installations;
}

async function findBrowsers () {
    if (OS.win)
        return await findWindowsBrowsers();

    if (OS.mac)
        return await findMacBrowsers();

    if (OS.linux)
        return await findLinuxBrowsers();
}


// API
export async function get () {
    if (!installationsCache)
        installationsCache = await findBrowsers();

    return installationsCache;
}
