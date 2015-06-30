import { execFile } from 'child_process';
import BrowserConnection from './connection';
import { MESSAGES, getText } from '../messages';
import OS from '../utils/os';


export default class LocalBrowserConnection extends BrowserConnection {
    constructor (gateway, browserInfo) {
        super(gateway);

        // NOTE: Give caller a time to assign event listeners
        process.nextTick(() => this._runBrowser(browserInfo));
    }

    async _runBrowser (browserInfo) {
        var { path, cmdList } = this._createBrowserExecParams(browserInfo);

        try {
            execFile(path, cmdList);
        }
        catch (err) {
            this.emit('error', getText(MESSAGES.unableToRunBrowser, browserInfo.path));
        }
    }

    _createBrowserExecParams (browserInfo) {
        var cmdList = browserInfo.cmd ? browserInfo.cmd.split(' ') : [];

        // NOTE: due to the fact that MacOS .app files actually are bundles
        // they can not be executed by execFile directly.
        // We use 'open' shell command instead.
        if (OS.mac)
            return {
                path:    'open',
                cmdList: ['-a', browserInfo.path, this.url, '--args'].concat(cmdList)
            };

        return {
            path:    browserInfo.path,
            cmdList: cmdList.concat(this.url)
        };
    }
}
