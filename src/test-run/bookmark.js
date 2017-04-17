import TEST_RUN_PHASE from '../test-run/phase';
import ERR_TYPE from '../errors/test-run/type';

import {
    SwitchToMainWindowCommand,
    SwitchToIframeCommand,
    SetNativeDialogHandlerCommand,
    SetTestSpeedCommand,
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

        this.url            = 'about:blank';
        this.dialogHandler  = testRun.activeDialogHandler;
        this.iframeSelector = testRun.activeIframeSelector;
        this.speed          = testRun.speed;
        this.ctx            = testRun.ctx;
        this.fixtureCtx     = testRun.fixtureCtx;
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

    async _restorePage (url) {
        var navigateCommand = new NavigateToCommand({ url });

        await this.testRun.executeCommand(navigateCommand);
    }

    async restore (callsite) {
        var prevPhase = this.testRun.phase;

        this.testRun.phase = TEST_RUN_PHASE.inBookmarkRestore;

        this.testRun.ctx        = this.ctx;
        this.testRun.fixtureCtx = this.fixtureCtx;

        try {
            await this._restoreSpeed();
            await this._restoreDialogHandler();

            if (this.role.opts.preserveUrl)
                await this._restorePage(this.role.url);

            else {
                await this._restorePage(this.url);
                await this._restoreWorkingFrame();
            }
        }
        catch (err) {
            err.callsite = callsite;

            throw err;
        }

        this.testRun.phase = prevPhase;
    }
}
