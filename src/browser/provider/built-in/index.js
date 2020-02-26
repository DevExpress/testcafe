import pathBrowserProvider from './path';
import locallyInstalledBrowserProvider from './locally-installed';
import remoteBrowserProvider from './remote';
import firefoxProvider from './dedicated/firefox';
import chromeProvider from './dedicated/chrome';
import edgeProvider from './dedicated/edge';

export default Object.assign(
    {
        'locally-installed': locallyInstalledBrowserProvider,
        'path':              pathBrowserProvider,
        'remote':            remoteBrowserProvider,
        'firefox':           firefoxProvider,
        'chrome':            chromeProvider,
        'chromium':          chromeProvider,
        'chrome-canary':     chromeProvider,
        'edge':              edgeProvider
    }
);
