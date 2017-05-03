import nodeVersion from 'node-version';
import pathBrowserProvider from './path';
import locallyInstalledBrowserProvider from './locally-installed';
import remoteBrowserProvider from './remote';


const chromeProvider = nodeVersion.major !== '0' ? require('./chrome') : null;

export default Object.assign(
    {
        'locally-installed': locallyInstalledBrowserProvider,
        'path':              pathBrowserProvider,
        'remote':            remoteBrowserProvider
    },
    chromeProvider && {
        'chrome:':   chromeProvider,
        'chromium:': chromeProvider
    }
);
