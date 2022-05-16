import os from 'os';
import OS from 'os-family';
import getLinuxOS from 'getos';
import execa from 'execa';
import { Dictionary } from '../../../configuration/interfaces';

const WINDOWS_BUILD_REG        = /(\d+\.\d+)(?:\.(\d+))?/;
const WINDOWS_SERVER_YEAR_REG  = /2008|2012|2016|2019/;
const WINDOWS_SERVER_RELEASES  = ['6.1', '6.2', '6.3', '10.0'];
const WINDOWS_11_MAJOR_VERSION = '10.0';
const WINDOWS_11_BUILD_PREFIX  = '22';

const MAC_RELEASES: Dictionary<string[]> = {
    '21': ['Monterey', '12'],
    '20': ['Big Sur', '11'],
    '19': ['Catalina', '10.15'],
    '18': ['Mojave', '10.14'],
    '17': ['High Sierra', '10.13'],
    '16': ['Sierra', '10.12'],
    '15': ['El Capitan', '10.11'],
    '14': ['Yosemite', '10.10'],
    '13': ['Mavericks', '10.9'],
    '12': ['Mountain Lion', '10.8'],
    '11': ['Lion', '10.7'],
    '10': ['Snow Leopard', '10.6'],
    '9':  ['Leopard', '10.5'],
    '8':  ['Tiger', '10.4'],
    '7':  ['Panther', '10.3'],
    '6':  ['Jaguar', '10.2'],
    '5':  ['Puma', '10.1'],
};

const WIN_RELEASES: Dictionary<string> = {
    '10.0.22': '11',
    '10.0':    '10',
    '6.3':     '8.1',
    '6.2':     '8',
    '6.1':     '7',
    '6.0':     'Vista',
    '5.2':     'Server 2003',
    '5.1':     'XP',
    '5.0':     '2000',
    '4.90':    'ME',
    '4.10':    '98',
    '4.03':    '95',
    '4.00':    '95',
};

function getMacRelease (release: string): string[] | null[] {
    if (MAC_RELEASES[release])
        return MAC_RELEASES[release];

    return [null, null];
}

function tryParseWindowsServerRelease (): string|null {
    let stdout;

    try {
        stdout = execa.sync('wmic', ['os', 'get', 'Caption']).stdout || '';
    }
    catch {
        stdout = execa.sync('powershell', ['(Get-CimInstance -ClassName Win32_OperatingSystem).caption']).stdout || '';
    }

    const year = (stdout.match(WINDOWS_SERVER_YEAR_REG) || [])[0];

    return year ? `Server ${ year }` : null;
}

function getWindowsRelease (release: string): string | null {
    const [, version, build] = WINDOWS_BUILD_REG.exec(release) || [];

    if (WINDOWS_SERVER_RELEASES.includes(version)) {
        const winServerReleaseName = tryParseWindowsServerRelease();

        if (winServerReleaseName)
            return winServerReleaseName;
    }

    if (version === WINDOWS_11_MAJOR_VERSION && build.startsWith(WINDOWS_11_BUILD_PREFIX))
        return WIN_RELEASES[`${ WINDOWS_11_MAJOR_VERSION }.${ WINDOWS_11_BUILD_PREFIX }`];

    return WIN_RELEASES[version] || null;
}

async function getLinuxOSInfo (): Promise<Dictionary<string> | null> {
    return new Promise(resolve => {
        getLinuxOS((e, osInfo) => {
            if (e)
                return resolve(null);

            if (osInfo.os === 'linux') {
                return resolve({
                    name:    osInfo.dist,
                    version: osInfo.release,
                });
            }

            return resolve(null);
        });
    });
}


export default async function getLocalOSInfo (): Promise<Dictionary<string> | null> {
    const release = os.release();

    if (OS.linux)
        return await getLinuxOSInfo();

    if (OS.mac) {
        const majorVersion            = release.split('.')[0];
        const osName                  = Number(majorVersion) > 15 ? 'macOS' : 'OS X';
        const [distName, distVersion] = getMacRelease(majorVersion);
        const version                 = distName && distVersion ? `${ distName } ${ distVersion }` : null;

        return version ? { name: osName, version } : null;
    }

    if (OS.win) {
        const version = getWindowsRelease(release);

        return version ? { name: 'Windows', version } : null;
    }

    return null;
}
