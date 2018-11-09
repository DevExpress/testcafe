import Promise from 'pinkie';

const lazyRequire              = require('import-lazy')(require);
const sourceMapSupport         = lazyRequire('source-map-support');
const hammerhead               = lazyRequire('testcafe-hammerhead');
const loadAssets               = lazyRequire('./load-assets');
const errorHandlers            = lazyRequire('./utils/handle-errors');
const BrowserConnectionGateway = lazyRequire('./browser/connection/gateway');
const BrowserConnection        = lazyRequire('./browser/connection');
const browserProviderPool      = lazyRequire('./browser/provider/pool');
const Runner                   = lazyRequire('./runner');

// NOTE: CoffeeScript can't be loaded lazily, because it will break stack traces
require('coffeescript');

export default class TestCafe {
    constructor (hostname, port1, port2, options = {}) {
        this._setupSourceMapsSupport();

        errorHandlers.registerErrorHandlers();

        if (options.retryTestPages)
            options.staticContentCaching = { maxAge: 3600, mustRevalidate: false };

        this.closed                   = false;
        this.proxy                    = new hammerhead.Proxy(hostname, port1, port2, options);
        this.browserConnectionGateway = new BrowserConnectionGateway(this.proxy, { retryTestPages: options.retryTestPages });
        this.runners                  = [];
        this.retryTestPages           = options.retryTestPages;

        this._registerAssets(options.developmentMode);
    }

    _registerAssets (developmentMode) {
        const { favIcon, coreScript, driverScript, uiScript,
            uiStyle, uiSprite, automationScript, legacyRunnerScript } = loadAssets(developmentMode);

        this.proxy.GET('/testcafe-core.js', { content: coreScript, contentType: 'application/x-javascript' });
        this.proxy.GET('/testcafe-driver.js', { content: driverScript, contentType: 'application/x-javascript' });

        this.proxy.GET('/testcafe-legacy-runner.js', {
            content:     legacyRunnerScript,
            contentType: 'application/x-javascript'
        });

        this.proxy.GET('/testcafe-automation.js', { content: automationScript, contentType: 'application/x-javascript' });
        this.proxy.GET('/testcafe-ui.js', { content: uiScript, contentType: 'application/x-javascript' });
        this.proxy.GET('/testcafe-ui-sprite.png', { content: uiSprite, contentType: 'image/png' });
        this.proxy.GET('/favicon.ico', { content: favIcon, contentType: 'image/x-icon' });

        this.proxy.GET('/testcafe-ui-styles.css', {
            content:              uiStyle,
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
