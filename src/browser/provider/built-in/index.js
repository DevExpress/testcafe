import PathBrowserProvider from './path';
import LocallyInstalledBrowserProvider from './locally-installed';
import RemoteBrowserProvider from './remote';
import saucelabsBrowserProvider from './saucelabs';
import phantomJSBrowserProvider from './phantomjs';


export default {
    'locally-installed': new LocallyInstalledBrowserProvider(),
    'path':              new PathBrowserProvider(),
    'remote':            new RemoteBrowserProvider(),
    'saucelabs':         saucelabsBrowserProvider,
    'phantomjs':         phantomJSBrowserProvider
};
