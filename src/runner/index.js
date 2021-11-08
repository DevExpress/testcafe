import { resolve as resolvePath, dirname } from 'path';
import debug from 'debug';
import promisifyEvent from 'promisify-event';
import { EventEmitter } from 'events';
import {
    flattenDeep as flatten,
    pull as remove,
    isFunction,
} from 'lodash';

import Bootstrapper from './bootstrapper';
import Reporter from '../reporter';
import Task from './task';
import defaultDebugLogger from '../notifications/debug-logger';
import { GeneralError } from '../errors/runtime';
import { RUNTIME_ERRORS } from '../errors/types';
import { assertType, is } from '../errors/runtime/type-assertions';
import { renderForbiddenCharsList } from '../errors/test-run/utils';
import detectFFMPEG from '../utils/detect-ffmpeg';
import checkFilePath from '../utils/check-file-path';
import {
    addRunningTest,
    removeRunningTest,
    startHandlingTestErrors,
    stopHandlingTestErrors,
} from '../utils/handle-errors';

import OPTION_NAMES from '../configuration/option-names';
import FlagList from '../utils/flag-list';
import prepareReporters from '../utils/prepare-reporters';
import loadClientScripts from '../custom-client-scripts/load';
import { setUniqueUrls } from '../custom-client-scripts/utils';
import ReporterStreamController from './reporter-stream-controller';
import CustomizableCompilers from '../configuration/customizable-compilers';
import { getConcatenatedValuesString, getPluralSuffix } from '../utils/string';
import isLocalhost from '../utils/is-localhost';
import WarningLog from '../notifications/warning-log';
import WARNING_MESSAGE from '../notifications/warning-message';
import authenticationHelper from '../cli/authentication-helper';
import { errors, findWindow } from 'testcafe-browser-tools';
import isCI from 'is-ci';
import RemoteBrowserProvider from '../browser/provider/built-in/remote';
import BrowserConnection from '../browser/connection';
import OS from 'os-family';
import detectDisplay from '../utils/detect-display';
import { validateQuarantineOptions } from '../utils/get-options/quarantine';
import logEntry from '../utils/log-entry';
import MessageBus from '../utils/message-bus';

const DEBUG_LOGGER = debug('testcafe:runner');

export default class Runner extends EventEmitter {
    constructor ({ proxy, browserConnectionGateway, configuration, compilerService }) {
        super();

        this._messageBus         = new MessageBus();
        this.proxy               = proxy;
        this.bootstrapper        = this._createBootstrapper(browserConnectionGateway, compilerService, this._messageBus);
        this.pendingTaskPromises = [];
        this.configuration       = configuration;
        this.isCli               = false;
        this.warningLog          = new WarningLog(null, WarningLog.createAddWarningCallback(this._messageBus));
        this.compilerService     = compilerService;
        this._options            = {};

        this.apiMethodWasCalled = new FlagList([
            OPTION_NAMES.src,
            OPTION_NAMES.browsers,
            OPTION_NAMES.reporter,
            OPTION_NAMES.clientScripts,
        ]);
    }

    _createBootstrapper (browserConnectionGateway, compilerService, messageBus) {
        return new Bootstrapper({ browserConnectionGateway, compilerService, messageBus });
    }

    _disposeBrowserSet (browserSet) {
        return browserSet.dispose().catch(e => DEBUG_LOGGER(e));
    }

    _disposeReporters (reporters) {
        return Promise.all(reporters.map(reporter => reporter.dispose().catch(e => DEBUG_LOGGER(e))));
    }

    _disposeTestedApp (testedApp) {
        return testedApp ? testedApp.kill().catch(e => DEBUG_LOGGER(e)) : Promise.resolve();
    }

    async _disposeTaskAndRelatedAssets (task, browserSet, reporters, testedApp) {
        task.abort();
        task.unRegisterClientScriptRouting();
        task.clearListeners();
        this._messageBus.abort();

        await this._disposeAssets(browserSet, reporters, testedApp);
    }

    _disposeAssets (browserSet, reporters, testedApp) {
        return Promise.all([
            this._disposeBrowserSet(browserSet),
            this._disposeReporters(reporters),
            this._disposeTestedApp(testedApp),
        ]);
    }

    _prepareArrayParameter (array) {
        array = flatten(array);

        if (this.isCli)
            return array.length === 0 ? void 0 : array;

        return array;
    }

    _createCancelablePromise (taskPromise) {
        const promise           = taskPromise.then(({ completionPromise }) => completionPromise);
        const removeFromPending = () => remove(this.pendingTaskPromises, promise);

        promise
            .then(removeFromPending)
            .catch(removeFromPending);

        promise.cancel = () => taskPromise
            .then(({ cancelTask }) => cancelTask())
            .then(removeFromPending);

        this.pendingTaskPromises.push(promise);

        return promise;
    }

    // Run task
    _getFailedTestCount (task, reporter) {
        let failedTestCount = reporter.taskInfo.testCount - reporter.taskInfo.passed;

        if (task.opts.stopOnFirstFail && !!failedTestCount)
            failedTestCount = 1;

        return failedTestCount;
    }

    async _getTaskResult (task, browserSet, reporters, testedApp) {
        if (!task.opts.live) {
            task.on('browser-job-done', job => {
                job.browserConnections.forEach(bc => browserSet.releaseConnection(bc));
            });
        }

        const browserSetErrorPromise = promisifyEvent(browserSet, 'error');
        const taskErrorPromise       = promisifyEvent(task, 'error');
        const messageBusErrorPromise = promisifyEvent(this._messageBus, 'error');
        const streamController       = new ReporterStreamController(this._messageBus, reporters);

        const taskDonePromise = this._messageBus.once('done')
            .then(() => browserSetErrorPromise.cancel())
            .then(() => {
                return Promise.all(reporters.map(reporter => reporter.taskInfo.pendingTaskDonePromise));
            });

        const promises = [
            taskDonePromise,
            browserSetErrorPromise,
            taskErrorPromise,
            messageBusErrorPromise,
        ];

        if (testedApp)
            promises.push(testedApp.errorPromise);

        try {
            await Promise.race(promises);
        }
        catch (err) {
            await this._disposeTaskAndRelatedAssets(task, browserSet, reporters, testedApp);

            throw err;
        }

        await this._disposeAssets(browserSet, reporters, testedApp);

        if (streamController.multipleStreamError)
            throw streamController.multipleStreamError;

        return this._getFailedTestCount(task, reporters[0]);
    }

    _createTask (tests, browserConnectionGroups, proxy, opts, warningLog) {
        return new Task({
            tests,
            browserConnectionGroups,
            proxy,
            opts,
            runnerWarningLog: warningLog,
            compilerService:  this.compilerService,
            messageBus:       this._messageBus,
        });
    }

    _runTask ({ reporters, browserSet, tests, testedApp, options }) {
        const task              = this._createTask(tests, browserSet.browserConnectionGroups, this.proxy, options, this.warningLog);
        const completionPromise = this._getTaskResult(task, browserSet, reporters, testedApp);
        let completed           = false;

        this._messageBus.on('start', startHandlingTestErrors);

        if (!this.configuration.getOption(OPTION_NAMES.skipUncaughtErrors)) {
            this._messageBus.on('test-run-start', addRunningTest);
            this._messageBus.on('test-run-done', removeRunningTest);
        }

        this._messageBus.on('done', stopHandlingTestErrors);

        task.on('error', stopHandlingTestErrors);

        const onTaskCompleted = () => {
            task.unRegisterClientScriptRouting();

            completed = true;
        };

        completionPromise
            .then(onTaskCompleted)
            .catch(onTaskCompleted);

        const cancelTask = async () => {
            if (!completed)
                await this._disposeTaskAndRelatedAssets(task, browserSet, reporters, testedApp);
        };

        return { completionPromise, cancelTask };
    }

    _registerAssets (assets) {
        assets.forEach(asset => this.proxy.GET(asset.path, asset.info));
    }

    _validateDebugLogger () {
        const debugLogger = this.configuration.getOption(OPTION_NAMES.debugLogger);

        const debugLoggerDefinedCorrectly = debugLogger === null || !!debugLogger &&
            ['showBreakpoint', 'hideBreakpoint'].every(method => method in debugLogger && isFunction(debugLogger[method]));

        if (!debugLoggerDefinedCorrectly) {
            this.configuration.mergeOptions({
                [OPTION_NAMES.debugLogger]: defaultDebugLogger,
            });
        }
    }

    _validateSpeedOption () {
        const speed = this.configuration.getOption(OPTION_NAMES.speed);

        if (speed === void 0)
            return;

        if (typeof speed !== 'number' || isNaN(speed) || speed < 0.01 || speed > 1)
            throw new GeneralError(RUNTIME_ERRORS.invalidSpeedValue);
    }

    _validateConcurrencyOption () {
        const concurrency = this.configuration.getOption(OPTION_NAMES.concurrency);

        if (concurrency === void 0)
            return;

        if (typeof concurrency !== 'number' || isNaN(concurrency) || concurrency < 1)
            throw new GeneralError(RUNTIME_ERRORS.invalidConcurrencyFactor);

        if (concurrency > 1 && this.bootstrapper.browsers.some(browser => {
            return browser instanceof BrowserConnection
                ? browser.browserInfo.browserOption.cdpPort
                : browser.browserOption.cdpPort;
        }))
            throw new GeneralError(RUNTIME_ERRORS.cannotSetConcurrencyWithCDPPort);
    }

    async _validateBrowsers () {
        const browsers = this.configuration.getOption(OPTION_NAMES.browsers);

        if (!browsers || Array.isArray(browsers) && !browsers.length)
            throw new GeneralError(RUNTIME_ERRORS.browserNotSet);

        if (OS.mac)
            await this._checkRequiredPermissions(browsers);

        if (OS.linux && !detectDisplay())
            await this._checkThatTestsCanRunWithoutDisplay(browsers);
    }

    _validateRequestTimeoutOption (optionName) {
        const requestTimeout = this.configuration.getOption(optionName);

        if (requestTimeout === void 0)
            return;

        assertType(is.nonNegativeNumber, null, `"${optionName}" option`, requestTimeout);
    }

    _validateProxyBypassOption () {
        let proxyBypass = this.configuration.getOption(OPTION_NAMES.proxyBypass);

        if (proxyBypass === void 0)
            return;

        assertType([ is.string, is.array ], null, 'The "proxyBypass" argument', proxyBypass);

        if (typeof proxyBypass === 'string')
            proxyBypass = [proxyBypass];

        proxyBypass = proxyBypass.reduce((arr, rules) => {
            assertType(is.string, null, 'The "proxyBypass" argument', rules);

            return arr.concat(rules.split(','));
        }, []);

        this.configuration.mergeOptions({ proxyBypass });
    }

    _getScreenshotOptions () {
        let { path, pathPattern } = this.configuration.getOption(OPTION_NAMES.screenshots) || {};

        if (!path)
            path = this.configuration.getOption(OPTION_NAMES.screenshotPath);

        if (!pathPattern)
            pathPattern = this.configuration.getOption(OPTION_NAMES.screenshotPathPattern);

        return { path, pathPattern };
    }

    _validateScreenshotOptions () {
        const { path, pathPattern } = this._getScreenshotOptions();

        const disableScreenshots = this.configuration.getOption(OPTION_NAMES.disableScreenshots) || !path;

        this.configuration.mergeOptions({ [OPTION_NAMES.disableScreenshots]: disableScreenshots });

        if (disableScreenshots)
            return;

        if (path) {
            this._validateScreenshotPath(path, 'screenshots base directory path');

            this.configuration.mergeOptions({ [OPTION_NAMES.screenshots]: { path: resolvePath(path) } });
        }

        if (pathPattern) {
            this._validateScreenshotPath(pathPattern, 'screenshots path pattern');

            this.configuration.mergeOptions({ [OPTION_NAMES.screenshots]: { pathPattern } });
        }
    }

    async _validateVideoOptions () {
        const videoPath            = this.configuration.getOption(OPTION_NAMES.videoPath);
        const videoEncodingOptions = this.configuration.getOption(OPTION_NAMES.videoEncodingOptions);

        let videoOptions = this.configuration.getOption(OPTION_NAMES.videoOptions);

        if (!videoPath) {
            if (videoOptions || videoEncodingOptions)
                throw new GeneralError(RUNTIME_ERRORS.cannotSetVideoOptionsWithoutBaseVideoPathSpecified);

            return;
        }

        this.configuration.mergeOptions({ [OPTION_NAMES.videoPath]: resolvePath(videoPath) });

        if (!videoOptions) {
            videoOptions = {};

            this.configuration.mergeOptions({ [OPTION_NAMES.videoOptions]: videoOptions });
        }

        if (videoOptions.ffmpegPath)
            videoOptions.ffmpegPath = resolvePath(videoOptions.ffmpegPath);
        else
            videoOptions.ffmpegPath = await detectFFMPEG();

        if (!videoOptions.ffmpegPath)
            throw new GeneralError(RUNTIME_ERRORS.cannotFindFFMPEG);
    }

    _validateCompilerOptions () {
        const compilerOptions = this.configuration.getOption(OPTION_NAMES.compilerOptions);

        if (!compilerOptions)
            return;

        const specifiedCompilers  = Object.keys(compilerOptions);
        const customizedCompilers = Object.keys(CustomizableCompilers);
        const wrongCompilers      = specifiedCompilers.filter(compiler => !customizedCompilers.includes(compiler));

        if (!wrongCompilers.length)
            return;

        const compilerListStr = getConcatenatedValuesString(wrongCompilers, void 0, "'");
        const pluralSuffix    = getPluralSuffix(wrongCompilers);

        throw new GeneralError(RUNTIME_ERRORS.cannotCustomizeSpecifiedCompilers, compilerListStr, pluralSuffix);
    }

    _validateRetryTestPagesOption () {
        const retryTestPagesOption = this.configuration.getOption(OPTION_NAMES.retryTestPages);

        if (!retryTestPagesOption)
            return;

        const ssl = this.configuration.getOption(OPTION_NAMES.ssl);

        if (ssl)
            return;

        const hostname = this.configuration.getOption(OPTION_NAMES.hostname);

        if (isLocalhost(hostname))
            return;

        throw new GeneralError(RUNTIME_ERRORS.cannotEnableRetryTestPagesOption);
    }

    _validateQuarantineOptions () {
        const quarantineMode = this.configuration.getOption(OPTION_NAMES.quarantineMode);

        if (typeof quarantineMode === 'object')
            validateQuarantineOptions(quarantineMode, OPTION_NAMES.quarantineMode);
    }

    async _validateRunOptions () {
        this._validateDebugLogger();
        this._validateScreenshotOptions();
        await this._validateVideoOptions();
        this._validateSpeedOption();
        this._validateProxyBypassOption();
        this._validateCompilerOptions();
        this._validateRetryTestPagesOption();
        this._validateRequestTimeoutOption(OPTION_NAMES.pageRequestTimeout);
        this._validateRequestTimeoutOption(OPTION_NAMES.ajaxRequestTimeout);
        this._validateQuarantineOptions();
        this._validateConcurrencyOption();
        await this._validateBrowsers();
    }

    _createRunnableConfiguration () {
        return this.bootstrapper
            .createRunnableConfiguration()
            .then(runnableConfiguration => {
                this.emit('done-bootstrapping');

                return runnableConfiguration;
            });
    }

    _validateScreenshotPath (screenshotPath, pathType) {
        const forbiddenCharsList = checkFilePath(screenshotPath);

        if (forbiddenCharsList.length)
            throw new GeneralError(RUNTIME_ERRORS.forbiddenCharatersInScreenshotPath, screenshotPath, pathType, renderForbiddenCharsList(forbiddenCharsList));
    }

    _setBootstrapperOptions () {
        this.configuration.prepare();
        this.configuration.notifyAboutOverriddenOptions(this.warningLog);
        this.configuration.notifyAboutDeprecatedOptions(this.warningLog);

        this.bootstrapper.sources                = this.configuration.getOption(OPTION_NAMES.src) || this.bootstrapper.sources;
        this.bootstrapper.browsers               = this.configuration.getOption(OPTION_NAMES.browsers) || this.bootstrapper.browsers;
        this.bootstrapper.concurrency            = this.configuration.getOption(OPTION_NAMES.concurrency);
        this.bootstrapper.appCommand             = this.configuration.getOption(OPTION_NAMES.appCommand) || this.bootstrapper.appCommand;
        this.bootstrapper.appInitDelay           = this.configuration.getOption(OPTION_NAMES.appInitDelay);
        this.bootstrapper.filter                 = this.configuration.getOption(OPTION_NAMES.filter) || this.bootstrapper.filter;
        this.bootstrapper.reporters              = this.configuration.getOption(OPTION_NAMES.reporter) || this.bootstrapper.reporters;
        this.bootstrapper.tsConfigPath           = this.configuration.getOption(OPTION_NAMES.tsConfigPath);
        this.bootstrapper.clientScripts          = this.configuration.getOption(OPTION_NAMES.clientScripts) || this.bootstrapper.clientScripts;
        this.bootstrapper.disableMultipleWindows = this.configuration.getOption(OPTION_NAMES.disableMultipleWindows);
        this.bootstrapper.proxyless              = this.configuration.getOption(OPTION_NAMES.proxyless);
        this.bootstrapper.compilerOptions        = this.configuration.getOption(OPTION_NAMES.compilerOptions);
        this.bootstrapper.browserInitTimeout     = this.configuration.getOption(OPTION_NAMES.browserInitTimeout);
        this.bootstrapper.hooks                  = this.configuration.getOption(OPTION_NAMES.hooks);
    }

    async _prepareClientScripts (tests, clientScripts) {
        return Promise.all(tests.map(async test => {
            if (test.isLegacy)
                return;

            let loadedTestClientScripts = await loadClientScripts(test.clientScripts, dirname(test.testFile.filename));

            loadedTestClientScripts = clientScripts.concat(loadedTestClientScripts);

            test.clientScripts = setUniqueUrls(loadedTestClientScripts);
        }));
    }

    async _hasLocalBrowsers (browserInfo) {
        for (const browser of browserInfo) {
            if (browser instanceof BrowserConnection)
                continue;

            if (await browser.provider.isLocalBrowser(void 0, browser.browserName))
                return true;
        }

        return false;
    }

    async _checkRequiredPermissions (browserInfo) {
        const hasLocalBrowsers = await this._hasLocalBrowsers(browserInfo);

        const { error } = await authenticationHelper(
            () => findWindow(''),
            errors.UnableToAccessScreenRecordingAPIError,
            {
                interactive: hasLocalBrowsers && !isCI,
            }
        );

        if (!error)
            return;

        if (hasLocalBrowsers)
            throw error;

        RemoteBrowserProvider.canDetectLocalBrowsers = false;
    }

    async _checkThatTestsCanRunWithoutDisplay (browserInfoSource) {
        for (let browserInfo of browserInfoSource) {
            if (browserInfo instanceof BrowserConnection)
                browserInfo = browserInfo.browserInfo;

            const isLocalBrowser    = await browserInfo.provider.isLocalBrowser(void 0, browserInfo.browserName);
            const isHeadlessBrowser = await browserInfo.provider.isHeadlessBrowser(void 0, browserInfo.browserName);

            if (isLocalBrowser && !isHeadlessBrowser) {
                throw new GeneralError(
                    RUNTIME_ERRORS.cannotRunLocalNonHeadlessBrowserWithoutDisplay,
                    browserInfo.alias
                );
            }
        }
    }

    async _applyOptions () {
        await this.configuration.asyncMergeOptions(this._options);

        return this._setBootstrapperOptions();
    }

    async _initReporters (reporters) {
        return Promise.all(reporters.map(reporter => reporter.init()))
            .then(initResults => {
                const reporterInitErrors = [];

                initResults.forEach(({ reporter, error }) => {
                    if (error) {
                        reporterInitErrors.push(`- "${reporter.plugin.name}": ${error.message}`);

                        remove(reporters, reporter);
                    }
                });

                const cannotInitAllReporters = initResults.length === reporterInitErrors.length;
                const reporterInitErrMessage = reporterInitErrors.join('\n');

                if (reporterInitErrors.length) {
                    if (cannotInitAllReporters)
                        throw new GeneralError(RUNTIME_ERRORS.cannotInitializeReporters, reporterInitErrMessage);
                    else
                        this.warningLog.addWarning(WARNING_MESSAGE.cannotInitializeReporters, reporterInitErrMessage);
                }
            });
    }

    // API
    embeddingOptions (opts) {
        const { assets, TestRunCtor } = opts;

        this._registerAssets(assets);
        this._options.TestRunCtor = TestRunCtor;

        return this;
    }

    src (...sources) {
        if (this.apiMethodWasCalled.src)
            throw new GeneralError(RUNTIME_ERRORS.multipleAPIMethodCallForbidden, OPTION_NAMES.src);

        this._options[OPTION_NAMES.src] = this._prepareArrayParameter(sources);
        this.apiMethodWasCalled.src     = true;

        return this;
    }

    browsers (...browsers) {
        if (this.apiMethodWasCalled.browsers)
            throw new GeneralError(RUNTIME_ERRORS.multipleAPIMethodCallForbidden, OPTION_NAMES.browsers);

        this._options.browsers           = this._prepareArrayParameter(browsers);
        this.apiMethodWasCalled.browsers = true;

        return this;
    }

    concurrency (concurrency) {
        this._options.concurrency = concurrency;

        return this;
    }

    reporter (name, output) {
        if (this.apiMethodWasCalled.reporter)
            throw new GeneralError(RUNTIME_ERRORS.multipleAPIMethodCallForbidden, OPTION_NAMES.reporter);

        this._options[OPTION_NAMES.reporter] = this._prepareArrayParameter(prepareReporters(name, output));
        this.apiMethodWasCalled.reporter     = true;

        return this;
    }

    filter (filter) {
        this._options.filter = filter;

        return this;
    }

    useProxy (proxy, proxyBypass) {
        this._options.proxy       = proxy;
        this._options.proxyBypass = proxyBypass;

        return this;
    }

    screenshots (...options) {
        let fullPage;
        let thumbnails;
        let [path, takeOnFails, pathPattern] = options;

        if (options.length === 1 && options[0] && typeof options[0] === 'object')
            ({ path, takeOnFails, pathPattern, fullPage, thumbnails } = options[0]);

        this._options.screenshots = { path, takeOnFails, pathPattern, fullPage, thumbnails };

        return this;
    }

    video (path, options, encodingOptions) {
        this._options[OPTION_NAMES.videoPath]            = path;
        this._options[OPTION_NAMES.videoOptions]         = options;
        this._options[OPTION_NAMES.videoEncodingOptions] = encodingOptions;

        return this;
    }

    startApp (command, initDelay) {
        this._options[OPTION_NAMES.appCommand]   = command;
        this._options[OPTION_NAMES.appInitDelay] = initDelay;

        return this;
    }

    tsConfigPath (path) {
        this._options[OPTION_NAMES.tsConfigPath] = path;

        return this;
    }

    clientScripts (...scripts) {
        if (this.apiMethodWasCalled.clientScripts)
            throw new GeneralError(RUNTIME_ERRORS.multipleAPIMethodCallForbidden, OPTION_NAMES.clientScripts);

        this._options[OPTION_NAMES.clientScripts] = this._prepareArrayParameter(scripts);
        this.apiMethodWasCalled.clientScripts     = true;

        return this;
    }

    compilerOptions (opts) {
        this._options[OPTION_NAMES.compilerOptions] = opts;

        return this;
    }

    run (options = {}) {
        let reporters;

        this.apiMethodWasCalled.reset();
        this._messageBus.clearListeners();

        this._options = Object.assign(this._options, options);

        const runTaskPromise = Promise.resolve()
            .then(() => Reporter.getReporterPlugins(this._options.reporter))
            .then(reporterPlugins => {
                reporters = reporterPlugins.map(reporter => new Reporter(reporter.plugin, this._messageBus, reporter.outStream, reporter.name));

                return this._initReporters(reporters);
            })
            .then(() => this._applyOptions())
            .then(() => {
                logEntry(DEBUG_LOGGER, this.configuration);

                return this._validateRunOptions();
            })
            .then(() => this._createRunnableConfiguration())
            .then(async ({ browserSet, tests, testedApp, commonClientScripts }) => {
                await this._prepareClientScripts(tests, commonClientScripts);

                const resultOptions = this.configuration.getOptions();

                await this.bootstrapper.compilerService?.setOptions({ value: resultOptions });

                return this._runTask({ reporters, browserSet, tests, testedApp, options: resultOptions });
            });

        return this._createCancelablePromise(runTaskPromise);
    }

    async stop () {
        // NOTE: When taskPromise is cancelled, it is removed from
        // the pendingTaskPromises array, which leads to shifting indexes
        // towards the beginning. So, we must copy the array in order to iterate it,
        // or we can perform iteration from the end to the beginning.
        const cancellationPromises = this.pendingTaskPromises.reduceRight((result, taskPromise) => {
            result.push(taskPromise.cancel());

            return result;
        }, []);

        await Promise.all(cancellationPromises);
    }
}
