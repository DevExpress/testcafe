import hammerhead from './deps/hammerhead';
import testCafeCore from './deps/testcafe-core';
import testCafeUI from './deps/testcafe-ui';

import MESSAGE from '../../test-run/client-messages';
import COMMAND_TYPE from '../../test-run/commands/type';
import { UncaughtErrorOnPage } from '../../errors/test-run';

import * as browser from '../browser';
import executeActionCommand from './command-executors/execute-action-command';
import executeHybridFnCommand from './command-executors/execute-hybrid-fn-command';
import ContextStorage from './storage';

var transport         = hammerhead.transport;
var Promise           = hammerhead.Promise;
var XhrBarrier        = testCafeCore.XhrBarrier;
var pageUnloadBarrier = testCafeCore.pageUnloadBarrier;
var eventUtils        = testCafeCore.eventUtils;
var modalBackground   = testCafeUI.modalBackground;


const COMMAND_EXECUTING_FLAG            = 'testcafe|driver|command-executing-flag';
const COMMAND_INTERRUPTED_BY_ERROR_FLAG = 'testcafe|driver|command-interrupted-by-error-flag';
const TEST_DONE_SENT_FLAG               = 'testcafe|driver|test-done-sent-flag';


export default class ClientDriver {
    constructor (testRunId, heartbeatUrl, browserStatusUrl, elementAvailabilityTimeout) {
        this.testRunId                  = testRunId;
        this.heartbeatUrl               = heartbeatUrl;
        this.browserStatusUrl           = browserStatusUrl;
        this.elementAvailabilityTimeout = elementAvailabilityTimeout;
        this.contextStorage             = new ContextStorage(window, testRunId);

        this.pageInitialXhrBarrier = new XhrBarrier();

        pageUnloadBarrier.init();
    }

    start () {
        browser.startHeartbeat(this.heartbeatUrl, hammerhead.createNativeXHR);

        modalBackground.initAndShowLoadingText();
        hammerhead.on(hammerhead.EVENTS.uncaughtJsError, err => this._onJsError(err));

        // NOTE: we should not send any message to the server if we've
        // sent the 'test-done' message but haven't got the response.
        if (this.contextStorage.getItem(TEST_DONE_SENT_FLAG)) {
            browser.checkStatus(this.browserStatusUrl, hammerhead.createNativeXHR);
            return;
        }

        eventUtils
            .documentReady()
            .then(() => this.pageInitialXhrBarrier.wait(true))
            .then(() => {
                var inCommandExecution        = this.contextStorage.getItem(COMMAND_EXECUTING_FLAG);
                var commandInterruptedByError = this.contextStorage.getItem(COMMAND_INTERRUPTED_BY_ERROR_FLAG);

                modalBackground.hide();

                if (inCommandExecution && !commandInterruptedByError)
                    this._onReady({ failed: false });
                else
                    this._onReady(null);
            });
    }

    _onJsError (err) {
        // NOTE: we should not send any message to the server if we've
        // sent the 'test-done' message but haven't got the response.
        if (this.contextStorage.getItem(TEST_DONE_SENT_FLAG))
            return Promise.resolve();

        this.contextStorage.setItem(COMMAND_INTERRUPTED_BY_ERROR_FLAG, true);

        return transport.queuedAsyncServiceMsg({
            cmd: MESSAGE.jsError,
            err: new UncaughtErrorOnPage(err.msg || err.message, err.pageUrl)
        });
    }

    _onReady (commandResult) {
        transport
            .queuedAsyncServiceMsg({ cmd: MESSAGE.ready, commandResult })
            .then(command => {
                if (command)
                    this._onCommand(command);
                else {
                    //TODO: resend the command with some interval (we will
                    // implement this when we have wait command on the server)
                }
            });
    }

    _onActionCommand (command) {
        this.contextStorage.setItem(COMMAND_INTERRUPTED_BY_ERROR_FLAG, false);

        var { startPromise, completionPromise } = executeActionCommand(command, this.elementAvailabilityTimeout);

        startPromise.then(() => this.contextStorage.setItem(COMMAND_EXECUTING_FLAG, true));

        completionPromise
            .catch(err => this._onJsError(err))
            .then(commandResult => {
                var commandInterruptedByError = this.contextStorage.getItem(COMMAND_INTERRUPTED_BY_ERROR_FLAG);

                this.contextStorage.setItem(COMMAND_EXECUTING_FLAG, false);

                return this._onReady(commandInterruptedByError ? null : commandResult);
            });
    }

    _onCommand (command) {
        if (command.type === COMMAND_TYPE.testDone)
            this._onTestDone();

        else if (command.type === COMMAND_TYPE.execHybridFn)
            executeHybridFnCommand(command).then(commandResult => this._onReady(commandResult));

        else
            this._onActionCommand(command);
    }

    _onTestDone () {
        this.contextStorage.setItem(TEST_DONE_SENT_FLAG, true);

        transport
            .queuedAsyncServiceMsg({ cmd: MESSAGE.done })
            .then(() => browser.checkStatus(this.browserStatusUrl, hammerhead.createNativeXHR));
    }

}

Object.defineProperty(window, '%testCafeClientDriver%', {
    enumerable:   false,
    configurable: false,
    writable:     false,
    value:        ClientDriver
});
