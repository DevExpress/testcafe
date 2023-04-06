import { GeneralError } from './errors/runtime';
import { RUNTIME_ERRORS } from './errors/types';
import CONTENT_TYPES from './assets/content-types';
import OPTION_NAMES from './configuration/option-names';
import * as INJECTABLES from './assets/injectables';
import { setupSourceMapSupport } from './utils/setup-sourcemap-support';
import BrowserConnectionGatewayStatus from './browser/connection/gateway/status';

const lazyRequire              = require('import-lazy')(require);
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
        setupSourceMapSupport();
        errorHandlers.registerErrorHandlers();

        this.closed        = false;
        this.proxy         = new hammerhead.Proxy();
        this.runners       = [];
        this.configuration = configuration;

        this.browserConnectionGateway = new BrowserConnectionGateway(this.proxy, this.configuration.browserConnectionGatewayOptions);

        const developmentMode = configuration.getOption(OPTION_NAMES.developmentMode);

        this.browserConnectionGateway.on('initialized', () => {
            this._registerAssets(developmentMode);
        });

        if (configuration.getOption(OPTION_NAMES.experimentalDebug)) {
            const v8Flags = configuration.getOption(OPTION_NAMES.v8Flags);

            this.compilerService = new CompilerHost({ developmentMode, v8Flags });
        }
    }

    _registerAssets (developmentMode) {
        const { favIcon, coreScript, driverScript, uiScript,
            uiStyle, uiSprite, uiSpriteSvg, automationScript, legacyRunnerScript } = loadAssets(developmentMode);

        this.proxy.GET(INJECTABLES.TESTCAFE_CORE, { content: coreScript, contentType: CONTENT_TYPES.javascript });
        this.proxy.GET(INJECTABLES.TESTCAFE_DRIVER, { content: driverScript, contentType: CONTENT_TYPES.javascript });

        this.proxy.GET(INJECTABLES.TESTCAFE_LEGACY_RUNNER, {
            content:     legacyRunnerScript,
            contentType: CONTENT_TYPES.javascript,
        });

        this.proxy.GET(INJECTABLES.TESTCAFE_AUTOMATION, { content: automationScript, contentType: CONTENT_TYPES.javascript });
        this.proxy.GET(INJECTABLES.TESTCAFE_UI, { content: uiScript, contentType: CONTENT_TYPES.javascript });
        this.proxy.GET(INJECTABLES.TESTCAFE_UI_SPRITE, { content: uiSprite, contentType: CONTENT_TYPES.png });
        this.proxy.GET(INJECTABLES.TESTCAFE_UI_SPRITE_SVG, { content: uiSpriteSvg, contentType: CONTENT_TYPES.svg });
        this.proxy.GET(INJECTABLES.DEFAULT_FAVICON_PATH, { content: favIcon, contentType: CONTENT_TYPES.icon });

        this.proxy.GET(INJECTABLES.TESTCAFE_UI_STYLES, {
            content:              uiStyle,
            contentType:          CONTENT_TYPES.css,
            isShadowUIStylesheet: true,
        });
    }

    _createRunner (isLiveMode) {
        const Ctor      = isLiveMode ? LiveModeRunner : Runner;
        const newRunner = new Ctor({
            proxy:                    this.proxy,
            browserConnectionGateway: this.browserConnectionGateway,
            configuration:            this.configuration.clone(OPTION_NAMES.hooks),
            compilerService:          this.compilerService,
        });

        this.runners.push(newRunner);

        return newRunner;
    }

    async _initializeBrowserConnectionGateway () {
        await this.configuration.ensureHostname();

        if (this.browserConnectionGateway.status === BrowserConnectionGatewayStatus.uninitialized)
            this.browserConnectionGateway.initialize(this.configuration.startOptions);
    }

    // API
    async createBrowserConnection () {
        // NOTE: 'remote' browser connection cannot be native automation.
        const browserInfo = await browserProviderPool.getBrowserInfo('remote');

        await this._initializeBrowserConnectionGateway();

        const connection = new BrowserConnection(this.browserConnectionGateway, browserInfo, true);

        connection.initialize();

        return connection;
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
    }
}
