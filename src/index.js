import { Proxy } from 'hammerhead';
import BrowserConnectionGateway from './browser/gateway';
import BrowserConnection from './browser/connection';
import Runner from './runner';
import read from './utils/read-file-relative';


// Const
const CORE_SCRIPT = read('./client/core/index.js');
const UI_SCRIPT   = read('./client/ui/index.js');
const UI_STYLE    = read('./client/ui/styles.css');
const UI_SPRITE   = read('./client/ui/sprite.png', true);


// TestCafe
export default class TestCafe {
    constructor (port1, port2, hostname = '127.0.0.1') {
        this.proxy                    = new Proxy(hostname, port1, port2);
        this.browserConnectionGateway = new BrowserConnectionGateway(this.proxy);

        this._registerAssets();
    }

    _registerAssets () {
        this.proxy.GET('/testcafe-core.js', { content: CORE_SCRIPT, contentType: 'application/x-javascript' });
        this.proxy.GET('/testcafe-ui.js', { content: UI_SCRIPT, contentType: 'application/x-javascript' });
        this.proxy.GET('/testcafe-ui-styles.css', { content: UI_STYLE, contentType: 'text/css' });
        this.proxy.GET('/testcafe-ui-sprite.png', { content: UI_SPRITE, contentType: 'image/png' });
    }


    // API
    createBrowserConnection () {
        return new BrowserConnection(this.browserConnectionGateway);
    }

    createRunner () {
        return new Runner(this.proxy, this.browserConnectionGateway);
    }

    close () {
        this.proxy.close();
    }
}
