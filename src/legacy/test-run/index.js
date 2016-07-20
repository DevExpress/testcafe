import path from 'path';
import { readSync as read } from 'read-file-relative';
import Mustache from 'mustache';
import { Session } from 'testcafe-hammerhead';
import COMMAND from './command';
import ERROR_TYPE from '../test-run-error/type';
import LegacyTestRunErrorFormattableAdapter from '../test-run-error/formattable-adapter';


// Const
const TEST_RUN_TEMPLATE        = read('../../client/legacy/test-run/index.js.mustache');
const IFRAME_TEST_RUN_TEMPLATE = read('../../client/legacy/test-run/iframe.js.mustache');


export default class LegacyTestRun extends Session {
    constructor (test, browserConnection, screenshotCapturer, opts) {
        var uploadsRoot = path.dirname(test.fixture.path);

        super(uploadsRoot);

        this.running  = false;
        this.unstable = false;

        this.opts              = opts;
        this.test              = test;
        this.browserConnection = browserConnection;

        this.isFileDownloading = false;

        this.errs                       = [];
        this.warnings                   = [];
        this.nativeDialogsInfo          = null;
        this.nativeDialogsInfoTimeStamp = 0;
        this.stepsSharedData            = {};
        this.screenshotCapturer         = screenshotCapturer;

        this.injectable.scripts.push('/testcafe-core.js');
        this.injectable.scripts.push('/testcafe-ui.js');
        this.injectable.scripts.push('/testcafe-runner.js');
        this.injectable.styles.push('/testcafe-ui-styles.css');
    }

    _getPayloadScript () {
        var sharedJs = this.test.fixture.getSharedJs();

        if (!this.running) {
            this.running = true;
            this.emit('start');
        }

        return Mustache.render(TEST_RUN_TEMPLATE, {
            stepNames:              JSON.stringify(this.test.stepData.names),
            testSteps:              this.test.stepData.js,
            sharedJs:               sharedJs,
            testRunId:              this.id,
            browserHeartbeatUrl:    this.browserConnection.heartbeatUrl,
            browserStatusUrl:       this.browserConnection.statusUrl,
            takeScreenshots:        this.screenshotCapturer.enabled,
            takeScreenshotsOnFails: this.opts.takeScreenshotsOnFails,
            skipJsErrors:           this.opts.skipJsErrors,
            nativeDialogsInfo:      JSON.stringify(this.nativeDialogsInfo),
            selectorTimeout:        this.opts.selectorTimeout
        });
    }

    _getIframePayloadScript (iframeWithoutSrc) {
        var sharedJs      = this.test.fixture.getSharedJs();
        var payloadScript = Mustache.render(IFRAME_TEST_RUN_TEMPLATE, {
            sharedJs:               sharedJs,
            takeScreenshotsOnFails: this.opts.takeScreenshotsOnFails,
            skipJsErrors:           this.opts.skipJsErrors,
            nativeDialogsInfo:      JSON.stringify(this.nativeDialogsInfo),
            selectorTimeout:        this.opts.selectorTimeout
        });

        return iframeWithoutSrc ? 'var isIFrameWithoutSrc = true;' + payloadScript : payloadScript;
    }

    async _addError (err) {
        var screenshotPath = null;
        var callsite       = err.__sourceIndex !== void 0 &&
                             err.__sourceIndex !== null &&
                             this.test.sourceIndex[err.__sourceIndex];

        try {
            screenshotPath = await this.screenshotCapturer.captureError(this.id, err);
        }
        catch (e) {
            // NOTE: swallow the error silently if we can't take screenshots for some
            // reason (e.g. we don't have permissions to write a screenshot file).
        }

        var errAdapter = new LegacyTestRunErrorFormattableAdapter(err, {
            userAgent:      this.browserConnection.userAgent,
            screenshotPath: screenshotPath,
            callsite:       callsite
        });

        this.errs.push(errAdapter);
    }

    async _fatalError (err) {
        await this._addError(err);
        this.emit('done');
    }

    getAuthCredentials () {
        return this.test.fixture.authCredentials;
    }

    handleFileDownload () {
        this.isFileDownloading = true;
    }

    handlePageError (ctx, errMsg) {
        this._fatalError({
            type:    ERROR_TYPE.pageNotLoaded,
            message: errMsg
        });

        ctx.redirect(this.browserConnection.idleUrl);
    }
}

// Service message handlers
var ServiceMessages = LegacyTestRun.prototype;

ServiceMessages[COMMAND.fatalError] = function (msg) {
    return this._fatalError(msg.err);
};

ServiceMessages[COMMAND.assertionFailed] = function (msg) {
    return this._addError(msg.err);
};

ServiceMessages[COMMAND.done] = function () {
    this.emit('done');
};

ServiceMessages[COMMAND.setStepsSharedData] = function (msg) {
    this.stepsSharedData = msg.stepsSharedData;
};

ServiceMessages[COMMAND.getStepsSharedData] = function () {
    return this.stepsSharedData;
};

ServiceMessages[COMMAND.getAndUncheckFileDownloadingFlag] = function () {
    var isFileDownloading = this.isFileDownloading;

    this.isFileDownloading = false;

    return isFileDownloading;
};

ServiceMessages[COMMAND.uncheckFileDownloadingFlag] = function () {
    this.isFileDownloading = false;
};

ServiceMessages[COMMAND.nativeDialogsInfoSet] = function (msg) {
    if (msg.timeStamp >= this.nativeDialogsInfoTimeStamp) {
        //NOTE: the server can get messages in the wrong sequence if they was sent with a little distance (several milliseconds),
        // we don't take to account old messages
        this.nativeDialogsInfoTimeStamp = msg.timeStamp;
        this.nativeDialogsInfo          = msg.info;
    }
};

ServiceMessages[COMMAND.takeScreenshot] = async function (msg) {
    try {
        return await this.screenshotCapturer.captureAction(this.id, msg);
    }
    catch (e) {
        // NOTE: swallow the error silently if we can't take screenshots for some
        // reason (e.g. we don't have permissions to write a screenshot file).
        return null;
    }

};
