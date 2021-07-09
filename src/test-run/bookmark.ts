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
import { ExecuteClientFunctionCommand, ExecuteSelectorCommand } from './commands/observation';
import Role from '../role/role';
import { DEFAULT_SPEED_VALUE } from '../configuration/default-values';
import BrowserConsoleMessages from './browser-console-messages';
import CommandBase from './commands/base';
import { CallsiteRecord } from 'callsite-record';

export default class TestRunBookmark {
    private readonly testRun: TestRun;
    private readonly role: Role;
    private url: string;
    private ctx: object | null;
    private fixtureCtx: object | null;
    private readonly dialogHandler: ExecuteClientFunctionCommand | null;
    private readonly iframeSelector: ExecuteSelectorCommand | null;
    private readonly speed: number;
    private readonly pageLoadTimeout: number;
    private readonly consoleMessages: BrowserConsoleMessages | null;

    public constructor (testRun: TestRun, role: Role) {
        this.testRun         = testRun;
        this.role            = role;
        this.url             = SPECIAL_BLANK_PAGE;
        this.ctx             = null;
        this.fixtureCtx      = null;
        this.dialogHandler   = null;
        this.iframeSelector  = null;
        this.speed           = DEFAULT_SPEED_VALUE;
        this.pageLoadTimeout = 0;
        this.consoleMessages = null;
        this.dialogHandler   = this.testRun.activeDialogHandler;
        this.iframeSelector  = this.testRun.activeIframeSelector;
        this.speed           = this.testRun.speed;
        this.pageLoadTimeout = this.testRun.pageLoadTimeout;
        this.consoleMessages = this.testRun.consoleMessages as BrowserConsoleMessages;
    }

    private async _initCtxs (): Promise<void> {
        if (this.testRun.compilerService) {
            this.ctx        = await this.testRun.compilerService.getCtx({ testRunId: this.testRun.id });
            this.fixtureCtx = await this.testRun.compilerService.getFixtureCtx({ testRunId: this.testRun.id });
        }
        else {
            this.ctx        = this.testRun.ctx;
            this.fixtureCtx = this.testRun.fixtureCtx as object;
        }
    }

    private async _restoreCtxs (): Promise<void> {
        if (this.testRun.compilerService) {
            await this.testRun.compilerService.setCtx({
                testRunId: this.testRun.id,
                value:     this.ctx as object
            });
            await this.testRun.compilerService.setFixtureCtx({
                testRunId: this.testRun.id,
                value:     this.fixtureCtx as object
            });
        }
        else {
            this.testRun.ctx        = this.ctx as object;
            this.testRun.fixtureCtx = this.fixtureCtx;
        }
    }

    public async init (): Promise<void> {
        await this._initCtxs();

        if (this.testRun.activeIframeSelector)
            await this.testRun.executeCommand(new SwitchToMainWindowCommand() as CommandBase);

        if (!this.role.opts.preserveUrl)
            await this.role.setCurrentUrlAsRedirectUrl(this.testRun);
    }

    private async _restoreDialogHandler (): Promise<void> {
        if (this.testRun.activeDialogHandler !== this.dialogHandler) {
            const restoreDialogCommand = new SetNativeDialogHandlerCommand({ dialogHandler: { fn: this.dialogHandler } });

            await this.testRun.executeCommand(restoreDialogCommand);
        }
    }

    private async _restoreSpeed (): Promise<void> {
        if (this.testRun.speed !== this.speed) {
            const restoreSpeedCommand = new SetTestSpeedCommand({ speed: this.speed });

            await this.testRun.executeCommand(restoreSpeedCommand);
        }
    }

    private async _restorePageLoadTimeout (): Promise<void> {
        if (this.testRun.pageLoadTimeout !== this.pageLoadTimeout) {
            const restorePageLoadTimeoutCommand = new SetPageLoadTimeoutCommand({ duration: this.pageLoadTimeout });

            await this.testRun.executeCommand(restorePageLoadTimeoutCommand);
        }
    }

    private async _restoreWorkingFrame (): Promise<void> {
        if (this.testRun.activeIframeSelector !== this.iframeSelector) {
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

    private _setConsoleMessages (): void {
        this.testRun.consoleMessages = this.consoleMessages as BrowserConsoleMessages;
    }

    private _setPhase (value: TEST_RUN_PHASE): void {
        this.testRun.phase = value;
    }

    public async restore (callsite: CallsiteRecord, stateSnapshot: StateSnapshot): Promise<void> {
        const prevPhase = await this.testRun.phase;

        this._setPhase(TEST_RUN_PHASE.inBookmarkRestore);
        await this._restoreCtxs();
        this._setConsoleMessages();

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

        this._setPhase(prevPhase);
    }
}
