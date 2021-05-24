import TEST_RUN_PHASE from '../test-run/phase';
import { TEST_RUN_ERRORS } from '../errors/types';
import { SPECIAL_BLANK_PAGE, StateSnapshot } from 'testcafe-hammerhead';

import {
    SwitchToMainWindowCommand,
    SwitchToIframeCommand,
    SetNativeDialogHandlerCommand,
    SetTestSpeedCommand,
    SetPageLoadTimeoutCommand
} from './commands/actions';

import { CurrentIframeNotFoundError, CurrentIframeIsNotLoadedError } from '../errors/test-run';
import TestRun from './index';
import TestRunProxy from '../services/compiler/test-run-proxy';
import { ExecuteClientFunctionCommand, ExecuteSelectorCommand } from './commands/observation';
import Role from '../role/role';
import { DEFAULT_SPEED_VALUE } from '../configuration/default-values';
import BrowserConsoleMessages from './browser-console-messages';
import CommandBase from './commands/base';
import { CallsiteRecord } from 'callsite-record';

export default class TestRunBookmark {
    private readonly testRun: TestRun | TestRunProxy;
    private readonly role: Role;
    private url: string;
    private readonly ctx: object;
    private readonly fixtureCtx: object;
    private dialogHandler: ExecuteClientFunctionCommand | null;
    private iframeSelector: ExecuteSelectorCommand | null;
    private speed: number;
    private pageLoadTimeout: number;
    private consoleMessages: BrowserConsoleMessages | null;

    public constructor (testRun: TestRun | TestRunProxy, role: Role) {
        this.testRun         = testRun;
        this.role            = role;
        this.url             = SPECIAL_BLANK_PAGE;
        this.ctx             = testRun.ctx;
        this.fixtureCtx      = testRun.fixtureCtx as object;
        this.dialogHandler   = null;
        this.iframeSelector  = null;
        this.speed           = DEFAULT_SPEED_VALUE;
        this.pageLoadTimeout = 0;
        this.consoleMessages = null;
    }

    public async init (): Promise<void> {
        this.dialogHandler   = await this.testRun.activeDialogHandler;
        this.iframeSelector  = await this.testRun.activeIframeSelector;
        this.speed           = await this.testRun.speed;
        this.pageLoadTimeout = await this.testRun.pageLoadTimeout;
        this.consoleMessages = await this.testRun.consoleMessages as BrowserConsoleMessages;

        if (await this.testRun.activeIframeSelector)
            await this.testRun.executeCommand(new SwitchToMainWindowCommand() as CommandBase);

        if (!this.role.opts.preserveUrl)
            await this.role.setCurrentUrlAsRedirectUrl(this.testRun);
    }

    private async _restoreDialogHandler (): Promise<void> {
        if (await this.testRun.activeDialogHandler !== this.dialogHandler) {
            const restoreDialogCommand = new SetNativeDialogHandlerCommand({ dialogHandler: { fn: this.dialogHandler } });

            await this.testRun.executeCommand(restoreDialogCommand);
        }
    }

    private async _restoreSpeed (): Promise<void> {
        if (await this.testRun.speed !== this.speed) {
            const restoreSpeedCommand = new SetTestSpeedCommand({ speed: this.speed });

            await this.testRun.executeCommand(restoreSpeedCommand);
        }
    }

    private async _restorePageLoadTimeout (): Promise<void> {
        if (await this.testRun.pageLoadTimeout !== this.pageLoadTimeout) {
            const restorePageLoadTimeoutCommand = new SetPageLoadTimeoutCommand({ duration: this.pageLoadTimeout });

            await this.testRun.executeCommand(restorePageLoadTimeoutCommand);
        }
    }

    private async _restoreWorkingFrame (): Promise<void> {
        if (await this.testRun.activeIframeSelector !== this.iframeSelector) {
            const switchWorkingFrameCommand = this.iframeSelector ?
                new SwitchToIframeCommand({ selector: this.iframeSelector }) :
                new SwitchToMainWindowCommand();

            try {
                await this.testRun.executeCommand(switchWorkingFrameCommand as CommandBase);
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

    private async _restorePage (url: string, stateSnapshot: StateSnapshot): Promise<void> {
        await this.testRun.navigateToUrl(url, true, JSON.stringify(stateSnapshot));
    }

    private async _setConsoleMessages (): Promise<void> {
        if (this.testRun instanceof TestRun)
            this.testRun.consoleMessages = this.consoleMessages as BrowserConsoleMessages;
        else
            await this.testRun.setConsoleMessages(this.consoleMessages as BrowserConsoleMessages);
    }

    private async _setPhase (value: TEST_RUN_PHASE): Promise<void> {
        if (this.testRun instanceof TestRun)
            this.testRun.phase = value;
        else
            await this.testRun.setPhase(value);
    }

    public async restore (callsite: CallsiteRecord, stateSnapshot: StateSnapshot): Promise<void> {
        const prevPhase = await this.testRun.phase;

        await this._setPhase(TEST_RUN_PHASE.inBookmarkRestore);

        this.testRun.ctx        = this.ctx;
        this.testRun.fixtureCtx = this.fixtureCtx;

        await this._setConsoleMessages();

        try {
            await this._restoreSpeed();
            await this._restorePageLoadTimeout();
            await this._restoreDialogHandler();

            const preserveUrl = this.role.opts.preserveUrl;

            await this._restorePage(this.role.redirectUrl as string, stateSnapshot);

            if (!preserveUrl)
                await this._restoreWorkingFrame();
        }
        catch (err) {
            err.callsite = callsite;

            throw err;
        }

        await this._setPhase(prevPhase);
    }
}
