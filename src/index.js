import { Proxy } from './../../hammerhead/lib';
import BrowserConnectionGateway from './browser/gateway';
import BrowserConnection from './browser/connection';
import Runner from './runner';
import read from './utils/read-file-relative';


// Const
const CORE_SCRIPT    = read('../../_compiled_/testcafe_client/testcafe_core.js');
const UI_CORE_SCRIPT = read('../../_compiled_/testcafe_client/testcafe_ui_core.js');
const UI_STYLE       = read('../../_compiled_/testcafe_client/styles.css');
const UI_SPRITE      = read('../../_compiled_/testcafe_client/uisprite.png', true);


// TestCafe
export default class TestCafe {
    constructor (port1, port2, hostname = '127.0.0.1') {
        this.proxy   = new Proxy(hostname, port1, port2);
        this.gateway = new BrowserConnectionGateway(this);

        this._registerAssets();
    }

    _registerAssets () {
        this.proxy.GET('/testcafe-core.js', { content: CORE_SCRIPT, contentType: 'application/x-javascript' });
        this.proxy.GET('/testcafe-ui-core.js', { content: UI_CORE_SCRIPT, contentType: 'application/x-javascript' });
        this.proxy.GET('/uistyle.css', { content: UI_STYLE, contentType: 'text/css' });
        this.proxy.GET('/uisprite.png', { content: UI_SPRITE, contentType: 'image/png' });
    }


    // API
    createBrowserConnection () {
        return new BrowserConnection(this.gateway);
    }

    createRunner () {
        return new Runner(this.proxy);
    }
}
