import { pull, isFunction } from 'lodash';
import testRunTracker from '../../api/test-run-tracker';
import { TestRunDispatcherProtocol } from './protocol';
import TestController from '../../api/test-controller';
import ObservedCallsitesStorage from '../../test-run/observed-callsites-storage';
import WarningLog from '../../notifications/warning-log';
import { AssertionCommand } from '../../test-run/commands/assertion';
import { Dictionary } from '../../configuration/interfaces';
import COMMAND_TYPE from '../../test-run/commands/type';
import { ActionCommandBase, CommandBase } from '../../test-run/commands/base';
import { TestRunProxyInit } from '../interfaces';
import Test from '../../api/structure/test';
import RequestHook from '../../api/request-hooks/hook';
import { generateUniqueId } from 'testcafe-hammerhead';
import { CallsiteRecord } from 'callsite-record';

import {
    CheckWindowPredicateData,
    SwitchToWindowByPredicateCommand,
    UseRoleCommand,
} from '../../test-run/commands/actions';

import ReExecutablePromise from '../../utils/re-executable-promise';
import AsyncEventEmitter from '../../utils/async-event-emitter';
import testRunMarker from '../../test-run/marker-symbol';
import { ERROR_FILENAME } from '../../test-run/execute-js-expression/constants';
import { UncaughtTestCafeErrorInCustomScript } from '../../errors/test-run';
import { FunctionMarker } from '../serialization/replicator/transforms/function-marker-transform/marker';
import getFn from '../../assertions/get-fn';
import { isThennable } from '../../utils/thennable';
import { PromiseMarker } from '../serialization/replicator/transforms/promise-marker-transform/marker';
import { ExecuteClientFunctionCommandBase } from '../../test-run/commands/observation';

class TestRunProxy extends AsyncEventEmitter {
    private [testRunMarker]: boolean;
    public readonly id: string;
    public readonly test: Test;
    public readonly controller: TestController;
    public readonly observedCallsites: ObservedCallsitesStorage;
    public readonly warningLog: WarningLog;
    public fixtureCtx: object;
    public debugging = false;
    private readonly dispatcher: TestRunDispatcherProtocol;
    public ctx: object;
    private readonly _options: Dictionary<OptionValue>;
    private readonly assertionCommands: Map<string, AssertionCommand>;
    private readonly switchToWindowByPredicateCommands: Map<string, SwitchToWindowByPredicateCommand>;
    private readonly asyncJsExpressionCallsites: Map<string, CallsiteRecord>;
    public readonly browser: Browser;
    public readonly disableMultipleWindows: boolean;
    public activeWindowId: null | string;

    public constructor ({ dispatcher, id, test, options, browser, activeWindowId, messageBus }: TestRunProxyInit) {
        super();

        this[testRunMarker]                    = true;
        this.dispatcher                        = dispatcher;
        this.id                                = id;
        this.test                              = test;
        this.ctx                               = Object.create(null);
        this.fixtureCtx                        = Object.create(null);
        this._options                          = options;
        this.browser                           = browser;
        this.assertionCommands                 = new Map<string, AssertionCommand>();
        this.switchToWindowByPredicateCommands = new Map<string, SwitchToWindowByPredicateCommand>();
        this.asyncJsExpressionCallsites        = new Map<string, CallsiteRecord>();
        this.controller                        = new TestController(this);
        this.observedCallsites                 = new ObservedCallsitesStorage();
        this.warningLog                        = new WarningLog(null, WarningLog.createAddWarningCallback(messageBus));
        this.disableMultipleWindows            = options.disableMultipleWindows as boolean;
        this.activeWindowId                    = activeWindowId;

        testRunTracker.addActiveTestRun(this);

        this._initializeRequestHooks();
    }

    private _initializeRequestHooks (): void {
        this.test.requestHooks.forEach(this._attachWarningLog, this);
    }

    private _attachWarningLog (hook: RequestHook): void {
        hook._warningLog = this.warningLog;
    }

    private _detachWarningLog (hook: RequestHook): void {
        hook._warningLog = null;
    }

    private _storeAssertionCommand (command: AssertionCommand): void {
        command.id = generateUniqueId();

        this.assertionCommands.set(command.id, command);
    }

    private _storeSwitchToWindowByPredicateCommand (command: SwitchToWindowByPredicateCommand): void {
        command.id = generateUniqueId();

        this.switchToWindowByPredicateCommands.set(command.id, command);
    }

    private _handleAssertionCommand (command: AssertionCommand): void {
        if (isFunction(command.actual)) {
            command.originActual = command.actual;
            command.actual       = new FunctionMarker();

            this._storeAssertionCommand(command);
        }
        else if (command.actual instanceof ReExecutablePromise)
            this._storeAssertionCommand(command);

        else if (isThennable(command.actual)) {
            command.originActual = command.actual;
            command.actual       = new PromiseMarker();

            this._storeAssertionCommand(command);
        }
    }

    private _handleExecuteClientFunctionCommandBase (command: ExecuteClientFunctionCommandBase): void {
        command.esmRuntime = this.test.esmRuntime;
    }

    private _storeActionCallsitesForExecutedAsyncJsExpression (callsite: CallsiteRecord): void {
        // @ts-ignore
        if (callsite?.filename !== ERROR_FILENAME)
            return;

        const id = generateUniqueId();

        // @ts-ignore
        callsite.id = id;

        this.asyncJsExpressionCallsites.set(id, callsite as CallsiteRecord);
    }

    public async executeCommand (command: CommandBase | ActionCommandBase, callsite?: CallsiteRecord | string): Promise<unknown> {
        if (command instanceof ActionCommandBase && callsite)
            this._storeActionCallsitesForExecutedAsyncJsExpression(callsite as CallsiteRecord);

        if (command.type === COMMAND_TYPE.assertion)
            this._handleAssertionCommand(command as AssertionCommand);
        else if (command.type === COMMAND_TYPE.useRole)
            this.dispatcher.onRoleAppeared((command as UseRoleCommand).role);
        else if (command.type === COMMAND_TYPE.switchToWindowByPredicate)
            this._storeSwitchToWindowByPredicateCommand(command as SwitchToWindowByPredicateCommand);
        else if (command instanceof ExecuteClientFunctionCommandBase)
            this._handleExecuteClientFunctionCommandBase(command);

        return this.dispatcher.executeCommand({
            command,
            callsite,
            id: this.id,
        });
    }

    public executeCommandSync (command: CommandBase, callsite: CallsiteRecord): unknown {
        if (command.type === COMMAND_TYPE.assertion)
            this._handleAssertionCommand(command as AssertionCommand);
        else if (command.type === COMMAND_TYPE.useRole)
            this.dispatcher.onRoleAppeared((command as UseRoleCommand).role);

        return this.dispatcher.executeCommandSync({
            command,
            callsite,
            id: this.id,
        });
    }

    public async addRequestHook (hook: RequestHook): Promise<void> {
        if (this.test.requestHooks.includes(hook))
            return;

        this.test.requestHooks.push(hook);
        this._attachWarningLog(hook);

        await this.dispatcher.addRequestEventListeners({
            hookId:        hook.id,
            hookClassName: hook._className,
            rules:         hook._requestFilterRules,
        });
    }

    public async removeRequestHook (hook: RequestHook): Promise<void> {
        if (!this.test.requestHooks.includes(hook))
            return;

        pull(this.test.requestHooks, hook);
        this._detachWarningLog(hook);

        await this.dispatcher.removeRequestEventListeners({ rules: hook._requestFilterRules });
    }

    public async getAssertionActualValue (commandId: string): Promise<unknown> {
        const command = this.assertionCommands.get(commandId) as AssertionCommand;

        return (command.actual as ReExecutablePromise)._reExecute();
    }

    public async executeAssertionFn (commandId: string): Promise<unknown> {
        const command = this.assertionCommands.get(commandId) as AssertionCommand;

        command.actual = command.originActual;

        const fn = getFn(command);

        return await fn();
    }

    public restoreOriginCallsiteForError (err: UncaughtTestCafeErrorInCustomScript): void {
        err.errCallsite = this.asyncJsExpressionCallsites.get(err.errCallsite.id);

        this.asyncJsExpressionCallsites.clear();
    }

    public checkWindow (commandId: string, { title, url }: CheckWindowPredicateData): boolean {
        const command = this.switchToWindowByPredicateCommands.get(commandId) as SwitchToWindowByPredicateCommand;

        return command.checkWindow({ title, url });
    }
}

export default TestRunProxy;


