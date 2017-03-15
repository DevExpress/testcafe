import ClientFunctionBuilder from '../client-functions/client-function-builder';
import TEST_RUN_PHASE from '../test-run/phase';

import {
    SwitchToMainWindowCommand,
    SwitchToIframeCommand,
    SetNativeDialogHandlerCommand,
    SetTestSpeedCommand,
    NavigateToCommand
} from './commands/actions';

class TestRunBookmark {
    constructor (testRun) {
        this.testRun = testRun;

        this.url            = 'about:blank';
        this.dialogHandler  = testRun.activeDialogHandler;
        this.iframeSelector = testRun.activeIframeSelector;
        this.speed          = testRun.speed;
        this.ctx            = testRun.ctx;
        this.fixtureCtx     = testRun.fixtureCtx;
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

            await this.testRun.executeCommand(switchWorkingFrameCommand);
        }
    }

    async _restorePage () {
        var navigateCommand = new NavigateToCommand({ url: this.url });

        await this.testRun.executeCommand(navigateCommand);
    }

    async restore (callsite) {
        var prevPhase = this.testRun.phase;

        this.testRun.phase = TEST_RUN_PHASE.inBookmarkRestore;

        this.testRun.ctx        = this.ctx;
        this.testRun.fixtureCtx = this.fixtureCtx;

        try {
            await this._restoreDialogHandler();
            await this._restoreSpeed();
            await this._restorePage();
            await this._restoreWorkingFrame();
        }
        catch (err) {
            err.callsite = callsite;

            throw err;
        }

        this.testRun.phase = prevPhase;
    }
}

export default async function createBookmark (testRun) {
    var bookmark = new TestRunBookmark(testRun);

    if (testRun.activeIframeSelector)
        await testRun.executeCommand(new SwitchToMainWindowCommand());

    var builder = new ClientFunctionBuilder(() => {
        /* eslint-disable no-undef */
        return window.location.href;
        /* eslint-enable no-undef */
    }, { boundTestRun: testRun });

    var getLocation = builder.getFunction();

    bookmark.url = await getLocation();

    return bookmark;
}
