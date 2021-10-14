import { adapter } from '../adapter';
import EventEmitter from '../utils/event-emitter';
import ComplexBarrier from '../barriers/complex-barrier';
import delay from '../utils/delay';
import { whilst } from '../utils/promise';
import { ActionCommandBase } from '../../test-run/commands/base';
import { Dictionary } from '../../configuration/interfaces';
import AUTOMATION_ERROR_TYPES from '../errors/automation-errors';
import { ActionElementIsInvisibleError } from '../../shared/errors';
import { ExecuteSelectorFn } from '../types';
import ElementsRetriever from '../utils/elements-retriever';
import { Automation, AutomationHandler } from './types';


const MAX_DELAY_AFTER_EXECUTION             = 2000;
const CHECK_ELEMENT_IN_AUTOMATIONS_INTERVAL = 250;

export default class ActionExecutor<T> extends EventEmitter {
    public static readonly EXECUTION_STARTED_EVENT = 'execution-started';
    public static readonly WAITING_FOR_ELEMENT_EVENT = 'waiting-for-elements';
    public static readonly ACTIONS_HANDLERS: Dictionary<AutomationHandler> = {};

    private readonly _command: ActionCommandBase;
    private readonly _elements: T[];
    private readonly _globalSelectorTimeout: number;
    private readonly _commandSelectorTimeout: number;
    private readonly _executeSelectorFn: ExecuteSelectorFn<T>;
    private _executionStartTime: number;
    private _targetElement: T | null;

    public constructor (command: ActionCommandBase, globalSelectorTimeout: number, testSpeed: number, executeSelectorFn: ExecuteSelectorFn<T>) {
        super();

        this._command       = command;
        this._targetElement = null;
        this._elements      = [];

        this._globalSelectorTimeout = globalSelectorTimeout;
        this._executionStartTime    = 0;
        this._executeSelectorFn     = executeSelectorFn;

        // TODO: move it to the server
        // @ts-ignore
        if (!command.options?.speed) // @ts-ignore
            command.options.speed = testSpeed;

        // TODO: and this
        // @ts-ignore
        this._commandSelectorTimeout = typeof command.selector?.timeout === 'number' ? command.selector.timeout : globalSelectorTimeout;
    }

    private _delayAfterExecution (): Promise<void> {
        // @ts-ignore TODO
        if (!this._command.options || this._command.options.speed === 1)
            return adapter.PromiseCtor.resolve();

        // @ts-ignore TODO
        return delay((1 - this._command.options.speed) * MAX_DELAY_AFTER_EXECUTION);
    }

    private _isExecutionTimeoutExpired (): boolean {
        return adapter.nativeMethods.dateNow() - this._executionStartTime >= this._commandSelectorTimeout;
    }

    private _ensureCommandArguments (): void {
        const handler = ActionExecutor.ACTIONS_HANDLERS[this._command.type];

        if (!handler?.ensureCmdArgs)
            return;

        handler.ensureCmdArgs(this._command);
    }

    private _ensureCommandElements (): Promise<void> {
        const elsRetriever = new ElementsRetriever(this._globalSelectorTimeout, this._executeSelectorFn);

        if (this._command.selector)
            // @ts-ignore TODO
            elsRetriever.push(this._command.selector);

        const additionalSelectorProps = ActionExecutor.ACTIONS_HANDLERS[this._command.type]?.additionalSelectorProps;

        if (additionalSelectorProps) {
            for (const prop of additionalSelectorProps) {
                if (this._command[prop])
                    // @ts-ignore TODO
                    elsRetriever.push(this._command[prop], prop);
            }
        }

        return elsRetriever.getElements()
            .then(elements => {
                this._elements.push(...elements);
            });
    }

    private _ensureCommandElementsProperties (): void {
        const handler = ActionExecutor.ACTIONS_HANDLERS[this._command.type];

        if (!handler?.ensureElsProps)
            return;

        handler.ensureElsProps(this._elements);
    }

    private _ensureCommandOptions (): void {
        const opts = this._command.options;

        // @ts-ignore TODO
        if (this._elements.length && opts && 'offsetX' in opts && 'offsetY' in opts) { // @ts-ignore
            const { offsetX, offsetY } = adapter.getOffsetOptions(this._elements[0], opts.offsetX, opts.offsetY);

            // @ts-ignore TODO
            opts.offsetX = offsetX;
            // @ts-ignore TODO
            opts.offsetY = offsetY;
        }
    }

    private _createAutomation (): Automation {
        const handler = ActionExecutor.ACTIONS_HANDLERS[this._command.type];

        if (!handler)
            throw new Error(`There is no handler for the "${this._command.type}" command.`);

        return handler.create(this._command, this._elements);
    }

    private _runAction (strictElementCheck: boolean): Promise<void> {
        return this._ensureCommandElements()
            .then(() => this._ensureCommandElementsProperties())
            .then(() => {
                this._ensureCommandOptions();

                const automation = this._createAutomation();

                if (automation.TARGET_ELEMENT_FOUND_EVENT) {
                    automation.on(automation.TARGET_ELEMENT_FOUND_EVENT, e => {
                        this._targetElement = e.element;

                        this.emit(ActionExecutor.EXECUTION_STARTED_EVENT);
                    });
                }
                else
                    this.emit(ActionExecutor.EXECUTION_STARTED_EVENT);

                return automation
                    .run(strictElementCheck);
            });
    }

    private _runRecursively (): Promise<void> {
        let actionFinished     = false;
        let strictElementCheck = true;

        return whilst(() => !actionFinished, () => {
            return this._runAction(strictElementCheck)
                .then(() => {
                    actionFinished = true;
                })
                .catch(err => {
                    if (this._isExecutionTimeoutExpired()) {
                        if (err.message === AUTOMATION_ERROR_TYPES.foundElementIsNotTarget) {
                            // If we can't get a target element via elementFromPoint but it's
                            // visible we click on the point where the element is located.
                            strictElementCheck = false;

                            return adapter.PromiseCtor.resolve();
                        }

                        throw err.message === AUTOMATION_ERROR_TYPES.elementIsInvisibleError ?
                            new ActionElementIsInvisibleError() : err;
                    }

                    return delay(CHECK_ELEMENT_IN_AUTOMATIONS_INTERVAL);
                });
        });
    }

    public execute (barriers: ComplexBarrier<any, any>): Promise<T[]> {
        this._executionStartTime = adapter.nativeMethods.dateNow();

        try {
            // TODO: I think that this check is unnecessary here. It checks only a key sequence of the pressKey command.
            // This check can be moved to the server.
            this._ensureCommandArguments();
        }
        catch (err) {
            return adapter.PromiseCtor.reject(err);
        }

        this.emit(ActionExecutor.WAITING_FOR_ELEMENT_EVENT, this._commandSelectorTimeout);

        return this._runRecursively()
            .then(() => Promise.all([
                this._delayAfterExecution(),
                barriers.wait(),
            ]))
            .then(() => {
                const elements = [...this._elements];

                if (this._targetElement)
                    elements[0] = this._targetElement;

                return elements;
            });
    }
}
