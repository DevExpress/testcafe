import Promise from 'promise';
import Mustache from 'mustache';
import { Session } from './../../../hammerhead/lib';
import COMMANDS from './commands';
import UploadsStorage from '../../upload';
import read from '../utils/read-file-relative';


// Const
const TEST_RUN_TEMPLATE        = read('../../_compiled_/testcafe_client/test-run.js.mustache');
const IFRAME_TEST_RUN_TEMPLATE = read('../../_compiled_/testcafe_client/iframe-test-run.js.mustache');


export default class TestRun extends Session {
    constructor (test, browserConnection, opts) {
        super();

        this.startTime = null;
        this.endTime   = null;
        this.unstable  = false;

        this.opts              = opts;
        this.suite             = this.opts.suite;
        this.fixture           = this.suite.fixtures[test.fixtureUid];
        this.test              = test;
        this.browserConnection = browserConnection;

        this.isFileDownloading = false;

        // TODO remove it then we move shared data to session storage
        this.errs                       = [];
        this.testError                  = null;
        this.restartCount               = 0;
        this.nextStep                   = 0;
        this.actionTargetWaiting        = 0;
        this.nativeDialogsInfo          = null;
        this.nativeDialogsInfoTimeStamp = 0;
        this.stepsSharedData            = {};

        this.injectable.scripts.push('/testcafe-core.js');
        this.injectable.scripts.push('/testcafe-ui-core.js');
        this.injectable.styles.push('/uistyle.css');
    }

    async _loadUploads (paths) {
        //TODO fix it after UploadStorage rewrite
        return new Promise((resolve, reject)=> {
            UploadsStorage.getFiles(paths, this.fixture.workingDir, (data, err) => {
                if (err)
                    reject(err);
                else
                    resolve(data);
            });
        });
    }

    _getPayloadScript () {
        var requireJs = this.suite.requireJsMap[this.fixture.requireJsMapKey];
        var sharedJs  = requireJs + this.fixture.remainderJs;

        // TODO
        var nextStep             = this.actionTargetWaiting ? this.nextStep - 1 : this.nextStep;

        this.actionTargetWaiting = false;

        if (!this.startTime)
            this.startTime = new Date();

        return Mustache.render(TEST_RUN_TEMPLATE, {
            stepNames:             JSON.stringify(this.test.stepData.names),
            testSteps:             this.test.stepData.js,
            sharedJs:              sharedJs,
            nextStep:              nextStep,
            testError:             this.testError ? JSON.stringify(this.testError) : 'null',
            browserIdleUrl:        this.browserConnection.idleUrl,
            browserHeartbeatUrl:   this.browserConnection.heartbeatUrl,
            takeScreenshotOnFails: this.opts.takeScreenshotOnFails,
            failOnJsErrors:        this.opts.failOnJsErrors,
            nativeDialogsInfo:     JSON.stringify(this.nativeDialogsInfo),
            iFrameTestRunScript:   JSON.stringify(this._getIFramePayloadScript())
        });
    }

    _getIFramePayloadScript () {
        var requireJs = this.suite.requireJsMap[this.fixture.requireJsMapKey];
        var sharedJs  = requireJs + this.fixture.remainderJs;

        return Mustache.render(IFRAME_TEST_RUN_TEMPLATE, {
            sharedJs:              sharedJs,
            browserIdleUrl:        this.browserConnection.idleUrl,
            takeScreenshotOnFails: this.opts.takeScreenshotOnFails,
            failOnJsErrors:        this.opts.failOnJsErrors,
            nativeDialogsInfo:     JSON.stringify(this.nativeDialogsInfo)
        });
    }

    _addError (err) {
        if (err.__sourceIndex !== void 0 && err.__sourceIndex !== null) {
            err.relatedSourceCode = this.suite.sourceIndex[err.__sourceIndex];
            delete err.__sourceIndex;
        }

        this.errs.push(err);
    }

    _fatalError (err) {
        this._addError(err);
        this._done();
    }

    _done () {
        this.endTime = new Date();
        this.emit('done');
    }

    getAuthCredentials () {
        return this.fixture.authCredentials;
    }

    handleFileDownload () {
        this.isFileDownloading = true;
    }

    handlePageError (ctx, err) {
        this._fatalError(err);
        ctx.redirect(this.browserConnection.idleUrl);
    }
}

// Service message handlers
var ServiceMessages = TestRun.prototype;

ServiceMessages[COMMANDS.fatalError] = function (msg) {
    this._fatalError(msg.err);
};

ServiceMessages[COMMANDS.assertionFailed] = function (msg) {
    this._addError(msg.err);
};

ServiceMessages[COMMANDS.done] = function () {
    this._done();
};

ServiceMessages[COMMANDS.setStepsSharedData] = function (msg) {
    this.stepsSharedData = msg.stepsSharedData;
};

ServiceMessages[COMMANDS.getStepsSharedData] = function () {
    return this.stepsSharedData;
};

ServiceMessages[COMMANDS.setNextStep] = function (msg) {
    this.nextStep = msg.nextStep;
};

ServiceMessages[COMMANDS.setActionTargetWaiting] = function (msg) {
    this.actionTargetWaiting = msg.value;
};

ServiceMessages[COMMANDS.setTestError] = function (msg) {
    this.testError = msg.err;
};

ServiceMessages[COMMANDS.getAndUncheckFileDownloadingFlag] = function () {
    var isFileDownloading  = this.isFileDownloading;

    this.isFileDownloading = false;

    return isFileDownloading;
};

ServiceMessages[COMMANDS.uncheckFileDownloadingFlag] = function () {
    this.isFileDownloading = false;
};

ServiceMessages[COMMANDS.nativeDialogsInfoSet] = function (msg) {
    if (msg.timeStamp >= this.nativeDialogsInfoTimeStamp) {
        //NOTE: the server can get messages in the wrong sequence if they was sent with a little distance (several milliseconds),
        // we don't take to account old messages
        this.nativeDialogsInfoTimeStamp = msg.timeStamp;
        this.nativeDialogsInfo          = msg.info;
    }
};
