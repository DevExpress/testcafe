import { GeneralError } from './errors/runtime';
import { RUNTIME_ERRORS } from './errors/types';
import CONTENT_TYPES from './assets/content-types';
import OPTION_NAMES from './configuration/option-names';
import * as INJECTABLES from './assets/injectables';

const lazyRequire              = require('import-lazy')(require);
const sourceMapSupport         = lazyRequire('source-map-support');
const hammerhead               = lazyRequire('testcafe-hammerhead');
const loadAssets               = lazyRequire('./load-assets');
const errorHandlers            = lazyRequire('./utils/handle-errors');
const BrowserConnectionGateway = lazyRequire('./browser/connection/gateway');
const BrowserConnection        = lazyRequire('./browser/connection');
const browserProviderPool      = lazyRequire('./browser/provider/pool');
const CompilerHost             = lazyRequire('./services/compiler/host');
const Runner                   = lazyRequire('./runner');
const LiveModeRunner           = lazyRequire('./live/test-runner');

// NOTE: CoffeeScript can't be loaded lazily, because it will break stack traces
require('coffeescript');

export default class TestCafe {
    constructor (configuration) {
        this._setupSourceMapsSupport();
        errorHandlers.registerErrorHandlers();

        const { hostname, port1, port2, options } = configuration.startOptions;

        this.closed                   = false;
        this.proxy                    = new hammerhead.Proxy(hostname, port1, port2, options);
        this.browserConnectionGateway = new BrowserConnectionGateway(this.proxy, { retryTestPages: configuration.getOption(OPTION_NAMES.retryTestPages) });
        this.runners                  = [];
        this.configuration            = configuration;

        this.compilerService = configuration.getOption(OPTION_NAMES.experimentalCompilerService) ? new CompilerHost() : void 0;

        this._registerAssets(options.developmentMode);
    }

    _registerAssets (developmentMode) {
        const { favIcon, coreScript, driverScript, uiScript,
            uiStyle, uiSprite, uiSpriteSvg, automationScript, legacyRunnerScript } = loadAssets(developmentMode);

        this.proxy.GET(INJECTABLES.TESTCAFE_CORE, { content: coreScript, contentType: CONTENT_TYPES.javascript });
        this.proxy.GET(INJECTABLES.TESTCAFE_DRIVER, { content: driverScript, contentType: CONTENT_TYPES.javascript });

        this.proxy.GET(INJECTABLES.TESTCAFE_LEGACY_RUNNER, {
            content:     legacyRunnerScript,
            contentType: CONTENT_TYPES.javascript
        });

        this.proxy.GET(INJECTABLES.TESTCAFE_AUTOMATION, { content: automationScript, contentType: CONTENT_TYPES.javascript });
        this.proxy.GET(INJECTABLES.TESTCAFE_UI, { content: uiScript, contentType: CONTENT_TYPES.javascript });
        this.proxy.GET(INJECTABLES.TESTCAFE_UI_SPRITE, { content: uiSprite, contentType: CONTENT_TYPES.png });
        this.proxy.GET(INJECTABLES.TESTCAFE_UI_SPRITE_SVG, { content: uiSpriteSvg, contentType: CONTENT_TYPES.svg });
        this.proxy.GET(INJECTABLES.TESTCAFE_ICON, { content: favIcon, contentType: CONTENT_TYPES.icon });

        this.proxy.GET(INJECTABLES.TESTCAFE_UI_STYLES, {
            content:              uiStyle,
            contentType:          CONTENT_TYPES.css,
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

    _createRunner (isLiveMode) {
        const Ctor      = isLiveMode ? LiveModeRunner : Runner;
        const newRunner = new Ctor({
            proxy:                    this.proxy,
            browserConnectionGateway: this.browserConnectionGateway,
            configuration:            this.configuration.clone(),
            compilerService:          this.compilerService
        });

        this.runners.push(newRunner);

        return newRunner;
    }

    // API
    async createBrowserConnection () {
        const browserInfo = await browserProviderPool.getBrowserInfo('remote');

        return new BrowserConnection(this.browserConnectionGateway, browserInfo, true);
    }

    createRunner () {
        return this._createRunner(false);
    }

    createLiveModeRunner () {
        if (this.runners.some(runner => runner instanceof LiveModeRunner))
            throw new GeneralError(RUNTIME_ERRORS.cannotCreateMultipleLiveModeRunners);

        return this._createRunner(true);
    }

    async close () {
        if (this.closed)
            return;

        this.closed = true;

        await Promise.all(this.runners.map(runner => runner.stop()));

        await browserProviderPool.dispose();

        if (this.compilerService)
            this.compilerService.stop();

        await this.browserConnectionGateway.close();
        this.proxy.close();
    }
}
