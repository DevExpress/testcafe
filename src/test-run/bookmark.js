import TEST_RUN_PHASE from '../test-run/phase';
import ERR_TYPE from '../errors/test-run/type';

import {
    SwitchToMainWindowCommand,
    SwitchToIframeCommand,
    SetNativeDialogHandlerCommand,
    SetTestSpeedCommand,
    SetPageLoadTimeoutCommand,
    NavigateToCommand
} from './commands/actions';

import {
    CurrentIframeNotFoundError,
    CurrentIframeIsNotLoadedError
} from '../errors/test-run';


export default class TestRunBookmark {
    constructor (testRun, role) {
        this.testRun = testRun;
        this.role    = role;

        this.url             = 'about:blank';
        this.dialogHandler   = testRun.activeDialogHandler;
        this.iframeSelector  = testRun.activeIframeSelector;
        this.speed           = testRun.speed;
        this.pageLoadTimeout = testRun.pageLoadTimeout;
        this.ctx             = testRun.ctx;
        this.fixtureCtx      = testRun.fixtureCtx;
        this.consoleMessages = testRun.consoleMessages;
    }

    async init () {
        if (this.testRun.activeIframeSelector)
            await this.testRun.executeCommand(new SwitchToMainWindowCommand());

        if (!this.role.opts.preserveUrl)
            this.url = await this.testRun.getCurrentUrl();
    }

    async _restoreDialogHandler () {
        if (this.testRun.activeDialogHandler !== this.dialogHandler) {
            var restoreDialogCommand = new SetNativeDialogHandlerCommand({ dialogHandler: { fn: this.dialogHandler } });

            await this.testRun.executeCommand(restoreDialogCommand);
        }
    }

    async _restoreSpeed () {
        if (this.testRun.speed !== this.speed) {
            var restoreSpeedCommand = new SetTestSpeedCommand({ speed: this.speed });

            await this.testRun.executeCommand(restoreSpeedCommand);
        }
    }

    async _restorePageLoadTimeout () {
        if (this.testRun.pageLoadTimeout !== this.pageLoadTimeout) {
            var restorePageLoadTimeoutCommand = new SetPageLoadTimeoutCommand({ duration: this.pageLoadTimeout });

            await this.testRun.executeCommand(restorePageLoadTimeoutCommand);
        }
    }

    async _restoreWorkingFrame () {
        if (this.testRun.activeIframeSelector !== this.iframeSelector) {
            var switchWorkingFrameCommand = this.iframeSelector ?
                new SwitchToIframeCommand({ selector: this.iframeSelector }) :
                new SwitchToMainWindowCommand();

            try {
                await this.testRun.executeCommand(switchWorkingFrameCommand);
            }
            catch (err) {
                if (err.type === ERR_TYPE.actionElementNotFoundError)
                    throw new CurrentIframeNotFoundError();

                if (err.type === ERR_TYPE.actionIframeIsNotLoadedError)
                    throw new CurrentIframeIsNotLoadedError();

                throw err;
            }
        }
    }

    async _restorePage (url, stateSnapshot) {
        var navigateCommand = new NavigateToCommand({ url, stateSnapshot });

        await this.testRun.executeCommand(navigateCommand);
    }

    async restore (callsite, stateSnapshot) {
        var prevPhase = this.testRun.phase;

        this.testRun.phase = TEST_RUN_PHASE.inBookmarkRestore;

        this.testRun.ctx             = this.ctx;
        this.testRun.fixtureCtx      = this.fixtureCtx;
        this.testRun.consoleMessages = this.consoleMessages;

        try {
            await this._restoreSpeed();
            await this._restorePageLoadTimeout();
            await this._restoreDialogHandler();

            var preserveUrl = this.role.opts.preserveUrl;
            var url = preserveUrl ? this.role.url : this.url;

            await this._restorePage(url, JSON.stringify(stateSnapshot));

            if (!preserveUrl)
                await this._restoreWorkingFrame();
        }
        catch (err) {
            err.callsite = callsite;

            throw err;
        }

        this.testRun.phase = prevPhase;
    }
}
