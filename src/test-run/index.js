import path from 'path';
import Promise from 'pinkie';
import { Session } from 'testcafe-hammerhead';
import { createDoneCommand } from './commands';
import CLIENT_MESSAGES from './client-messages';


export default class TestRun extends Session {
    constructor (test, browserConnection, screenshotCapturer, opts) {
        var uploadsRoot = path.dirname(test.fixture.path);

        super(uploadsRoot);

        this.opts               = opts;
        this.test               = test;
        this.browserConnection  = browserConnection;
        this.screenshotCapturer = screenshotCapturer;

        this.started        = false;
        this.pendingCommand = null;
        this.pendingRequest = null;
        this.pendingJsError = null;

        this.errs = [];
    }

    _getPayloadScript () {
        // TODO
    }

    _getIframePayloadScript () {
        // TODO
    }

    async _start () {
        this.started = true;

        try {
            await this.test.fn(this);
        }
        catch (err) {
            this.errs.push(err);
        }
        finally {
            this._done();
        }
    }

    async _done () {
        if (this.pendingJsError) {
            this.errs.push(this.pendingJsError);
            this.pendingJsError = null;
        }

        await this.executeCommand(createDoneCommand());
        this.emit('done');
    }

    _resolvePendingCommand () {
        this.pendingCommand.resolve();
        this.pendingCommand = null;
    }

    _rejectPendingCommand (err) {
        this.pendingCommand.reject(err);
        this.pendingCommand = null;
    }

    _resolvePendingRequest (command) {
        this.pendingRequest.resolve(command);
        this.pendingRequest = null;
    }

    getAuthCredentials () {
        // TODO
    }

    handleFileDownload () {
        // TODO
    }

    handlePageError () {
        // TODO
    }

    executeCommand (command) {
        if (this.pendingCommand)
            throw new Error('An attempt to execute a command when a previous command is still being executed was detected.');

        var pendingJsError = this.pendingJsError;

        if (pendingJsError) {
            this.pendingJsError = null;
            return Promise.reject(pendingJsError);
        }

        if (this.pendingRequest)
            this._resolvePendingRequest(command);

        return new Promise((resolve, reject) => this.pendingCommand = { command, resolve, reject });
    }
}

// Service message handlers
var ServiceMessages = TestRun.prototype;

ServiceMessages[CLIENT_MESSAGES.ready] = function (commandResult) {
    this.pendingRequest = null;

    if (!this.started)
        this._start();

    if (this.pendingCommand) {
        if (commandResult) {
            if (commandResult.failed)
                this._rejectPendingCommand(commandResult.err);
            else
                this._resolvePendingCommand();
        }
        else
            return Promise.resolve(this.pendingCommand.command);
    }

    return new Promise((resolve, reject) => this.pendingRequest = { resolve, reject });
};

ServiceMessages[CLIENT_MESSAGES.jsError] = function (msg) {
    if (this.pendingCommand)
        this._rejectPendingCommand(msg.err);
    else
        this.pendingJsError = msg.err;
};

ServiceMessages[CLIENT_MESSAGES.done] = function () {
    this.pendingCommand.resolve();
};
