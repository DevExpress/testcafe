import path from 'path';
import { readSync as read } from 'read-file-relative';
import Promise from 'pinkie';
import Mustache from 'mustache';
import { Session } from 'testcafe-hammerhead';
import TestRunErrorFormattableAdapter from '../errors/test-run/formattable-adapter';
import { TestDone as TestDoneCommand } from './commands';
import COMMAND_TYPE from './commands/type';
import CLIENT_MESSAGES from './client-messages';


//Const
const TEST_RUN_TEMPLATE = read('../client/test-run/index.js.mustache');


export default class TestRun extends Session {
    constructor (test, browserConnection, screenshotCapturer, opts) {
        var uploadsRoot = path.dirname(test.fixture.path);

        super(uploadsRoot);

        this.opts               = opts;
        this.test               = test;
        this.browserConnection  = browserConnection;
        this.screenshotCapturer = screenshotCapturer;

        this.running                = false;
        this.pendingCommand         = null;
        this.pendingRequest         = null;
        this.pendingJsError         = null;
        this.currentCommandCallsite = null;

        this.injectable.scripts.push('/testcafe-core.js');
        this.injectable.scripts.push('/testcafe-ui.js');
        this.injectable.scripts.push('/testcafe-runner.js');
        this.injectable.scripts.push('/testcafe-driver.js');
        this.injectable.styles.push('/testcafe-ui-styles.css');

        this.errs = [];
    }

    _getPayloadScript () {
        return Mustache.render(TEST_RUN_TEMPLATE, {
            testRunId:           this.id,
            browserHeartbeatUrl: this.browserConnection.heartbeatUrl,
            browserStatusUrl:    this.browserConnection.statusUrl
        });
    }

    _getIframePayloadScript () {
        // TODO
    }

    async _start () {
        this.running = true;
        this.emit('start');

        try {
            await this.test.fn(this);
        }
        catch (err) {
            this.errs.push(new TestRunErrorFormattableAdapter(err, this.browserConnection.userAgent, '', this.currentCommandCallsite));
        }
        finally {
            this._done();
        }
    }

    async _done () {
        if (this.pendingJsError) {
            this.errs.push(new TestRunErrorFormattableAdapter(this.pendingJsError, this.browserConnection.userAgent, '', this.currentCommandCallsite));
            this.pendingJsError = null;
        }

        await this.executeCommand(new TestDoneCommand());
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

    executeCommand (command, callsite) {
        if (this.pendingCommand)
            throw new Error('An attempt to execute a command when a previous command is still being executed was detected.');

        this.currentCommandCallsite = callsite;

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

ServiceMessages[CLIENT_MESSAGES.ready] = function (msg) {
    var commandResult = msg.commandResult;

    this.pendingRequest = null;

    if (!this.running)
        this._start();

    if (this.pendingCommand) {
        //NOTE: ignore client messages if testDone command is received
        if (this.pendingCommand.command.type !== COMMAND_TYPE.testDone && commandResult) {
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
