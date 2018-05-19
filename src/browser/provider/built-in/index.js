import pathBrowserProvider from './path';
import locallyInstalledBrowserProvider from './locally-installed';
import remoteBrowserProvider from './remote';
import firefoxProvider from './firefox';
import chromeProvider from './chrome';

export default Object.assign(
    {
        'locally-installed': locallyInstalledBrowserProvider,
        'path':              pathBrowserProvider,
        'remote':            remoteBrowserProvider,
        'firefox':           firefoxProvider,
        'chrome':            chromeProvider,
        'chromium':          chromeProvider,
        'chrome-canary':     chromeProvider
    }
);
