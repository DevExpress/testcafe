import TEST_RUN_PHASE from '../test-run/phase';
import { TEST_RUN_ERRORS } from '../errors/types';
import { SPECIAL_BLANK_PAGE } from 'testcafe-hammerhead';

import {
    SwitchToMainWindowCommand,
    SwitchToIframeCommand,
    SetNativeDialogHandlerCommand,
    SetTestSpeedCommand,
    SetPageLoadTimeoutCommand
} from './commands/actions';

import {
    CurrentIframeNotFoundError,
    CurrentIframeIsNotLoadedError
} from '../errors/test-run';

export default class TestRunBookmark {
    constructor (testRun, role) {
        this.testRun = testRun;
        this.role    = role;

        this.url             = SPECIAL_BLANK_PAGE;
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
            const restoreDialogCommand = new SetNativeDialogHandlerCommand({ dialogHandler: { fn: this.dialogHandler } });

            await this.testRun.executeCommand(restoreDialogCommand);
        }
    }

    async _restoreSpeed () {
        if (this.testRun.speed !== this.speed) {
            const restoreSpeedCommand = new SetTestSpeedCommand({ speed: this.speed });

            await this.testRun.executeCommand(restoreSpeedCommand);
        }
    }

    async _restorePageLoadTimeout () {
        if (this.testRun.pageLoadTimeout !== this.pageLoadTimeout) {
            const restorePageLoadTimeoutCommand = new SetPageLoadTimeoutCommand({ duration: this.pageLoadTimeout });

            await this.testRun.executeCommand(restorePageLoadTimeoutCommand);
        }
    }

    async _restoreWorkingFrame () {
        if (this.testRun.activeIframeSelector !== this.iframeSelector) {
            const switchWorkingFrameCommand = this.iframeSelector ?
                new SwitchToIframeCommand({ selector: this.iframeSelector }) :
                new SwitchToMainWindowCommand();

            try {
                await this.testRun.executeCommand(switchWorkingFrameCommand);
            }
            catch (err) {
                if (err.code === TEST_RUN_ERRORS.actionElementNotFoundError)
                    throw new CurrentIframeNotFoundError();

                if (err.code === TEST_RUN_ERRORS.actionIframeIsNotLoadedError)
                    throw new CurrentIframeIsNotLoadedError();

                throw err;
            }
        }
    }

    async _restorePage (url, stateSnapshot) {
        await this.testRun.navigateToUrl(url, true, JSON.stringify(stateSnapshot));
    }

    async restore (callsite, stateSnapshot) {
        const prevPhase = this.testRun.phase;

        this.testRun.phase = TEST_RUN_PHASE.inBookmarkRestore;

        this.testRun.ctx             = this.ctx;
        this.testRun.fixtureCtx      = this.fixtureCtx;
        this.testRun.consoleMessages = this.consoleMessages;

        try {
            await this._restoreSpeed();
            await this._restorePageLoadTimeout();
            await this._restoreDialogHandler();

            const preserveUrl = this.role.opts.preserveUrl;
            const url         = preserveUrl ? this.role.url : this.url;

            await this._restorePage(url, stateSnapshot);

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
