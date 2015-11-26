import path from 'path';
import { readSync as read } from 'read-file-relative';
import Mustache from 'mustache';
import { Session } from 'testcafe-hammerhead';
import COMMAND from './command';
import ERROR_TYPE from '../../reporters/errors/type';


// Const
const TEST_RUN_TEMPLATE        = read('../../client/test-run/index.js.mustache');
const IFRAME_TEST_RUN_TEMPLATE = read('../../client/test-run/iframe.js.mustache');


export default class TestRun extends Session {
    constructor (test, browserConnection, screenshotCapturer, opts) {
        var uploadsRoot = path.dirname(test.fixture.path);

        super(uploadsRoot);

        this.running  = false;
        this.unstable = false;

        this.opts              = opts;
        this.test              = test;
        this.browserConnection = browserConnection;

        this.isFileDownloading = false;

        // TODO remove it then we move shared data to session storage
        this.errs                       = [];
        this.deferredError              = null;
        this.restartCount               = 0;
        this.nextStep                   = 0;
        this.actionTargetWaiting        = 0;
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

        // TODO
        var nextStep = this.actionTargetWaiting ? this.nextStep - 1 : this.nextStep;

        this.actionTargetWaiting = false;

        if (!this.running) {
            this.running = true;
            this.emit('start');
        }

        return Mustache.render(TEST_RUN_TEMPLATE, {
            stepNames:              JSON.stringify(this.test.stepData.names),
            testSteps:              this.test.stepData.js,
            sharedJs:               sharedJs,
            nextStep:               nextStep,
            deferredError:          this.deferredError ? JSON.stringify(this.deferredError) : 'null',
            browserHeartbeatUrl:    this.browserConnection.heartbeatUrl,
            browserStatusUrl:       this.browserConnection.statusUrl,
            takeScreenshots:        this.screenshotCapturer.enabled,
            takeScreenshotsOnFails: this.opts.takeScreenshotsOnFails,
            skipJsErrors:           this.opts.skipJsErrors,
            nativeDialogsInfo:      JSON.stringify(this.nativeDialogsInfo),
            iFrameTestRunScript:    JSON.stringify(this._getIframePayloadScript())
        });
    }

    _getIframePayloadScript () {
        var sharedJs = this.test.fixture.getSharedJs();

        return Mustache.render(IFRAME_TEST_RUN_TEMPLATE, {
            sharedJs:               sharedJs,
            takeScreenshotsOnFails: this.opts.takeScreenshotsOnFails,
            skipJsErrors:           this.opts.skipJsErrors,
            nativeDialogsInfo:      JSON.stringify(this.nativeDialogsInfo)
        });
    }

    async _addError (err) {
        if (err.__sourceIndex !== void 0 && err.__sourceIndex !== null) {
            err.relatedSourceCode = this.test.sourceIndex[err.__sourceIndex];
            delete err.__sourceIndex;
        }

        try {
            err.screenshotPath = await this.screenshotCapturer.captureError(err);
        }
        catch (e) {
            // NOTE: swallow the error silently if we can't take screenshots for some
            // reason (e.g. we don't have permissions to write a screenshot file).
        }

        this.errs.push(err);
    }

    async _fatalError (err, deferred) {
        // TODO: move this logic to the client when localStorageSandbox will be implemented in the
        // testcafe-hammerhead repo https://github.com/DevExpress/testcafe-hammerhead/issues/252 !!!
        if (deferred) {
            this.deferredError = err;
            return;
        }

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
var ServiceMessages = TestRun.prototype;

ServiceMessages[COMMAND.fatalError] = function (msg) {
    return this._fatalError(msg.err, msg.deferred);
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

ServiceMessages[COMMAND.setNextStep] = function (msg) {
    this.nextStep = msg.nextStep;
};

ServiceMessages[COMMAND.setActionTargetWaiting] = function (msg) {
    this.actionTargetWaiting = msg.value;
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
        return await this.screenshotCapturer.captureAction(msg);
    }
    catch (e) {
        // NOTE: swallow the error silently if we can't take screenshots for some
        // reason (e.g. we don't have permissions to write a screenshot file).
        return null;
    }

};
