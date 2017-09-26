import nodeVersion from 'node-version';
import pathBrowserProvider from './path';
import locallyInstalledBrowserProvider from './locally-installed';
import remoteBrowserProvider from './remote';
import firefoxProvider from './firefox';


const chromeProvider = nodeVersion.major !== '0' ? require('./chrome') : null;


export default Object.assign(
    {
        'locally-installed': locallyInstalledBrowserProvider,
        'path':              pathBrowserProvider,
        'remote':            remoteBrowserProvider,
        'firefox':           firefoxProvider
    },
    chromeProvider && {
        'chrome':        chromeProvider,
        'chromium':      chromeProvider,
        'chrome-canary': chromeProvider,
    }
);
