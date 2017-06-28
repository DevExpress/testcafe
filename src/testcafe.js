import Promise from 'pinkie';
import { readSync as read } from 'read-file-relative';
import { Proxy } from 'testcafe-hammerhead';
import { CLIENT_RUNNER_SCRIPT as LEGACY_RUNNER_SCRIPT } from 'testcafe-legacy-api';
import BrowserConnectionGateway from './browser/connection/gateway';
import BrowserConnection from './browser/connection';
import browserProviderPool from './browser/provider/pool';
import Runner from './runner';

// Const
const CORE_SCRIPT       = read('./client/core/index.js');
const DRIVER_SCRIPT     = read('./client/driver/index.js');
const UI_SCRIPT         = read('./client/ui/index.js');
const AUTOMATION_SCRIPT = read('./client/automation/index.js');
const UI_STYLE          = read('./client/ui/styles.css');
const UI_SPRITE         = read('./client/ui/sprite.png', true);
const FAVICON           = read('./client/ui/favicon.ico', true);


export default class TestCafe {
    constructor (hostname, port1, port2) {
        this.closed                   = false;
        this.proxy                    = new Proxy(hostname, port1, port2);
        this.browserConnectionGateway = new BrowserConnectionGateway(this.proxy);
        this.runners                  = [];

        this._registerAssets();
    }

    _registerAssets () {
        this.proxy.GET('/testcafe-core.js', { content: CORE_SCRIPT, contentType: 'application/x-javascript' });
        this.proxy.GET('/testcafe-driver.js', { content: DRIVER_SCRIPT, contentType: 'application/x-javascript' });
        this.proxy.GET('/testcafe-legacy-runner.js', {
            content:     LEGACY_RUNNER_SCRIPT,
            contentType: 'application/x-javascript'
        });
        this.proxy.GET('/testcafe-automation.js', { content: AUTOMATION_SCRIPT, contentType: 'application/x-javascript' });
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
    async createBrowserConnection () {
        var browserInfo = await browserProviderPool.getBrowserInfo('remote');

        return new BrowserConnection(this.browserConnectionGateway, browserInfo, true);
    }

    createRunner () {
        var newRunner = new Runner(this.proxy, this.browserConnectionGateway);

        this.runners.push(newRunner);

        return newRunner;
    }

    async close () {
        if (this.closed)
            return;

        this.closed = true;

        await Promise.all(this.runners.map(runner => runner.stop()));

        await browserProviderPool.dispose();

        this.browserConnectionGateway.close();
        this.proxy.close();
    }
}
