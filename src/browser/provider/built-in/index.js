import PathBrowserProvider from './path';
import LocalBrowserProvider from './local';
import RemoteBrowserProvider from './remote';
import saucelabsBrowserProvider from './saucelabs';
import phantomJSBrowserProvider from './phantomjs';


export default {
    'local':     new LocalBrowserProvider(),
    'path':      new PathBrowserProvider(),
    'remote':    new RemoteBrowserProvider(),
    'saucelabs': saucelabsBrowserProvider,
    'phantomjs': phantomJSBrowserProvider
};
