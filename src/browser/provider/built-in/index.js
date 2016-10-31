import pathBrowserProvider from './path';
import locallyInstalledBrowserProvider from './locally-installed';
import remoteBrowserProvider from './remote';


export default {
    'locally-installed': locallyInstalledBrowserProvider,
    'path':              pathBrowserProvider,
    'remote':            remoteBrowserProvider
};
