import { readSync as read } from 'read-file-relative';
import { Proxy } from 'testcafe-hammerhead';
import BrowserConnectionGateway from './browser-connection/gateway';
import BrowserConnection from './browser-connection';
import Runner from './runner';

// Const
const CORE_SCRIPT   = read('./client/core/index.js');
const RUNNER_SCRIPT = read('./client/runner/index.js');
const UI_SCRIPT     = read('./client/ui/index.js');
const UI_STYLE      = read('./client/ui/styles.css');
const UI_SPRITE     = read('./client/ui/sprite.png', true);
const FAVICON       = read('./client/ui/favicon.ico', true);


export default class TestCafe {
    constructor (hostname, port1, port2) {
        this.proxy                    = new Proxy(hostname, port1, port2);
        this.browserConnectionGateway = new BrowserConnectionGateway(this.proxy);

        this._registerAssets();
    }

    _registerAssets () {
        this.proxy.GET('/testcafe-core.js', { content: CORE_SCRIPT, contentType: 'application/x-javascript' });
        this.proxy.GET('/testcafe-runner.js', { content: RUNNER_SCRIPT, contentType: 'application/x-javascript' });
        this.proxy.GET('/testcafe-ui.js', { content: UI_SCRIPT, contentType: 'application/x-javascript' });
        this.proxy.GET('/testcafe-ui-sprite.png', { content: UI_SPRITE, contentType: 'image/png' });
        this.proxy.GET('/favicon.ico', { content: FAVICON, contentType: 'image/x-icon' });

        this.proxy.GET('/testcafe-ui-styles.css', {
            content:              UI_STYLE,
            contentType:          'text/css',
            isShadowUIStylesheet: true
        });
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
