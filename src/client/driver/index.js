import hammerhead from './deps/hammerhead';
import testCafeCore from './deps/testcafe-core';
import testCafeUI from './deps/testcafe-ui';

import MESSAGE from '../../test-run/client-messages';
import COMMAND_TYPE from '../../test-run/commands/type';
import { UncaughtErrorOnPage } from '../../errors/test-run';

import * as browser from '../browser';
import executeActionCommand from './command-executors/execute-action-command';
import ContextStorage from './storage';

var transport         = hammerhead.transport;
var XhrBarrier        = testCafeCore.XhrBarrier;
var pageUnloadBarrier = testCafeCore.pageUnloadBarrier;
var eventUtils        = testCafeCore.eventUtils;
var modalBackground   = testCafeUI.modalBackground;


const COMMAND_EXECUTING_FLAG            = 'testcafe|driver|command-executing-flag';
const COMMAND_INTERRUPTED_BY_ERROR_FLAG = 'testcafe|driver|command-interrupted-by-error-flag';


export default class ClientDriver {
    constructor (testRunId, heartbeatUrl, browserStatusUrl) {
        this.testRunId        = testRunId;
        this.heartbeatUrl     = heartbeatUrl;
        this.browserStatusUrl = browserStatusUrl;
        this.contextStorage   = new ContextStorage(window, testRunId);

        this.pageInitialXhrBarrier = new XhrBarrier();

        pageUnloadBarrier.init();
    }

    start () {
        browser.startHeartbeat(this.heartbeatUrl, hammerhead.nativeMethods.XMLHttpRequest);

        modalBackground.initAndShowLoadingText();
        hammerhead.on(hammerhead.EVENTS.uncaughtJsError, err => this._onJsError(err));

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
        this.contextStorage.setItem(COMMAND_INTERRUPTED_BY_ERROR_FLAG, true);

        return transport
            .asyncServiceMsg({
                cmd: MESSAGE.jsError,
                err: new UncaughtErrorOnPage(err.msg || err.message, err.pageUrl)
            });
    }

    _onReady (commandResult) {
        transport
            .asyncServiceMsg({ cmd: MESSAGE.ready, commandResult })
            .then(command => {
                if (command)
                    this._onCommand(command);
                else {
                    //TODO: resend the command with some interval (we will
                    // implement this when we have wait command on the server)
                }
            });
    }

    _onCommand (command) {
        this.contextStorage.setItem(COMMAND_INTERRUPTED_BY_ERROR_FLAG, false);

        if (command.type === COMMAND_TYPE.testDone) {
            this._onTestDone();
            return;
        }

        var { startPromise, completePromise } = executeActionCommand(command);

        startPromise.then(() => this.contextStorage.setItem(COMMAND_EXECUTING_FLAG, true));

        completePromise
            .catch(err => this._onJsError(err))
            .then(commandResult => {
                var commandInterruptedByError = this.contextStorage.getItem(COMMAND_INTERRUPTED_BY_ERROR_FLAG);

                this.contextStorage.setItem(COMMAND_EXECUTING_FLAG, false);

                return this._onReady(commandInterruptedByError ? null : commandResult);
            });
    }

    _onTestDone () {
        transport
            .asyncServiceMsg({ cmd: MESSAGE.done })
            .then(() => browser.checkStatus(this.browserStatusUrl, hammerhead.nativeMethods.XMLHttpRequest));
    }

}

Object.defineProperty(window, '%testCafeClientDriver%', {
    enumerable:   false,
    configurable: false,
    writable:     false,
    value:        ClientDriver
});
