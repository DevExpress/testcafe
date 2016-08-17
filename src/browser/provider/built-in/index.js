import PathBrowserProvider from './path';
import LocallyInstalledBrowserProvider from './locally-installed';
import RemoteBrowserProvider from './remote';


export default {
    'locally-installed': new LocallyInstalledBrowserProvider(),
    'path':              new PathBrowserProvider(),
    'remote':            new RemoteBrowserProvider()
};
