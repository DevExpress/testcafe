import Promise from 'pinkie';
import sourceMapSupport from 'source-map-support';
import { readSync as read } from 'read-file-relative';
import { Proxy } from 'testcafe-hammerhead';
import { CLIENT_RUNNER_SCRIPT as LEGACY_RUNNER_SCRIPT } from 'testcafe-legacy-api';
import BrowserConnectionGateway from './browser/connection/gateway';
import BrowserConnection from './browser/connection';
import browserProviderPool from './browser/provider/pool';
import Runner from './runner';
import { registerErrorHandlers } from './utils/handle-errors';

// Const
const UI_STYLE  = read('./client/ui/styles.css');
const UI_SPRITE = read('./client/ui/sprite.png', true);
const FAVICON   = read('./client/ui/favicon.ico', true);

export default class TestCafe {
    constructor (hostname, port1, port2, options = {}) {
        this._setupSourceMapsSupport();

        registerErrorHandlers();

        if (options.retryTestPages)
            options.staticContentCaching = { maxAge: 3600, mustRevalidate: false };

        this.closed                   = false;
        this.proxy                    = new Proxy(hostname, port1, port2, options);
        this.browserConnectionGateway = new BrowserConnectionGateway(this.proxy, { retryTestPages: options.retryTestPages });
        this.runners                  = [];
        this.retryTestPages           = options.retryTestPages;

        this._registerAssets(options.developmentMode);
    }

    _registerAssets (developmentMode) {
        const scriptNameSuffix = developmentMode ? 'js' : 'min.js';
        const coreScript       = read(`./client/core/index.${scriptNameSuffix}`);
        const driverScript     = read(`./client/driver/index.${scriptNameSuffix}`);
        const uiScript         = read(`./client/ui/index.${scriptNameSuffix}`);
        const automationScript = read(`./client/automation/index.${scriptNameSuffix}`);

        this.proxy.GET('/testcafe-core.js', { content: coreScript, contentType: 'application/x-javascript' });
        this.proxy.GET('/testcafe-driver.js', { content: driverScript, contentType: 'application/x-javascript' });
        this.proxy.GET('/testcafe-legacy-runner.js', {
            content:     LEGACY_RUNNER_SCRIPT,
            contentType: 'application/x-javascript'
        });
        this.proxy.GET('/testcafe-automation.js', { content: automationScript, contentType: 'application/x-javascript' });
        this.proxy.GET('/testcafe-ui.js', { content: uiScript, contentType: 'application/x-javascript' });
        this.proxy.GET('/testcafe-ui-sprite.png', { content: UI_SPRITE, contentType: 'image/png' });
        this.proxy.GET('/favicon.ico', { content: FAVICON, contentType: 'image/x-icon' });

        this.proxy.GET('/testcafe-ui-styles.css', {
            content:              UI_STYLE,
            contentType:          'text/css',
            isShadowUIStylesheet: true
        });
    }

    _setupSourceMapsSupport () {
        sourceMapSupport.install({
            hookRequire:              true,
            handleUncaughtExceptions: false,
            environment:              'node'
        });
    }

    // API
    async createBrowserConnection () {
        const browserInfo = await browserProviderPool.getBrowserInfo('remote');

        return new BrowserConnection(this.browserConnectionGateway, browserInfo, true);
    }

    createRunner () {
        const newRunner = new Runner(this.proxy, this.browserConnectionGateway, { retryTestPages: this.retryTestPages });

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
