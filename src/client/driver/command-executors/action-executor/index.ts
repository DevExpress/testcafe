import EventEmitter from '../../../core/utils/event-emitter';
import ComplexBarrier from '../../barriers/complex-barrier';
import delay from '../../../core/utils/delay';
import { whilst } from '../../../core/utils/promise';
import { ActionCommandBase } from '../../../../test-run/commands/base';
import { Dictionary } from '../../../../configuration/interfaces';
import { ExecuteSelectorFn } from '../../../../shared/types';
import ElementsRetriever from './elements-retriever';
import { Automation, AutomationHandler } from '../../../automation/types';
// @ts-ignore
import { nativeMethods, Promise } from '../../deps/hammerhead';
import { getOffsetOptions } from '../../../core/utils/offsets';
import { TEST_RUN_ERRORS } from '../../../../errors/types';
import AxisValues from '../../../core/utils/values/axis-values';
import { DispatchEventFn } from '../../../../proxyless/client/types';

const MAX_DELAY_AFTER_EXECUTION             = 2000;
const CHECK_ELEMENT_IN_AUTOMATIONS_INTERVAL = 250;

interface ActionExecutorOptions {
    globalSelectorTimeout: number;
    testSpeed: number;
    executeSelectorFn: ExecuteSelectorFn<HTMLElement>;
    dispatchProxylessEventFn: DispatchEventFn;
    leftTopPoint: AxisValues<number>;
}

export default class ActionExecutor extends EventEmitter {
    public static readonly EXECUTION_STARTED_EVENT = 'execution-started';
    public static readonly WAITING_FOR_ELEMENT_EVENT = 'waiting-for-elements';
    public static readonly WARNING_EVENT = 'warning';
    public static readonly ACTIONS_HANDLERS: Dictionary<AutomationHandler> = {};

    private readonly _command: ActionCommandBase;
    private readonly _options: ActionExecutorOptions;
    private readonly _commandSelectorTimeout: number;
    private _elements: HTMLElement[];
    private _executionStartTime: number;
    private _targetElement: HTMLElement | null;

    public constructor (command: ActionCommandBase, options: ActionExecutorOptions) {
        super();

        this._command            = command;
        this._targetElement      = null;
        this._elements           = [];
        this._options            = options;
        this._executionStartTime = 0;

        this._prepareCommand(command, options);

        this._commandSelectorTimeout = this._getCommandSelectorTimeout(command, options);
    }

    private _prepareCommand (command: ActionCommandBase, options: ActionExecutorOptions): void {
        // TODO: move it to the server
        // @ts-ignore
        if (command.options && !command.options.speed) // @ts-ignore
            command.options.speed = options.testSpeed;
    }

    private _getCommandSelectorTimeout (command: ActionCommandBase, options: ActionExecutorOptions): number {
        // @ts-ignore
        return typeof command.selector?.timeout === 'number' ? command.selector.timeout : options.globalSelectorTimeout;
    }

    private _delayAfterExecution (): Promise<void> {
        // @ts-ignore TODO
        if (!this._command.options || this._command.options.speed === 1)
            return Promise.resolve();

        // @ts-ignore TODO
        return delay((1 - this._command.options.speed) * MAX_DELAY_AFTER_EXECUTION);
    }

    private _isExecutionTimeoutExpired (): boolean {
        return nativeMethods.dateNow() - this._executionStartTime >= this._commandSelectorTimeout;
    }

    private _ensureCommandArguments (): void {
        const handler = ActionExecutor.ACTIONS_HANDLERS[this._command.type];

        if (!handler?.ensureCmdArgs)
            return;

        handler.ensureCmdArgs(this._command);
    }

    private _ensureCommandElements (): Promise<void> {
        const elsRetriever = new ElementsRetriever(this._options.globalSelectorTimeout, this._options.executeSelectorFn);

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
            .then((elements: HTMLElement[]) => {
                this._elements = elements;
            });
    }

    private _ensureCommandElementsProperties (): void {
        const handler = ActionExecutor.ACTIONS_HANDLERS[this._command.type];

        if (!handler?.ensureElsProps)
            return;

        handler.ensureElsProps(this._elements);
    }

    private async _ensureCommandOptions (): Promise<void> {
        const opts = this._command.options;

        // @ts-ignore TODO
        if (this._elements.length && opts && 'offsetX' in opts && 'offsetY' in opts) { // @ts-ignore
            const { offsetX, offsetY } = getOffsetOptions(this._elements[0], opts.offsetX, opts.offsetY);

            // @ts-ignore TODO
            opts.isDefaultOffset = !opts.offsetX && !opts.offsetY;
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

        return handler.create(this._command, this._elements, this._options.dispatchProxylessEventFn, this._options.leftTopPoint);
    }

    private _runAction (strictElementCheck: boolean): Promise<void> {
        return this._ensureCommandElements()
            .then(() => this._ensureCommandElementsProperties())
            .then(() => this._ensureCommandOptions())
            .then(() => {
                const automation = this._createAutomation();

                if (automation.WARNING_EVENT) {
                    automation.on(automation.WARNING_EVENT, warning => {
                        this.emit(ActionExecutor.WARNING_EVENT, warning);
                    });
                }

                if (automation.TARGET_ELEMENT_FOUND_EVENT) {
                    automation.on(automation.TARGET_ELEMENT_FOUND_EVENT, e => {
                        this._targetElement = e.element;

                        this.emit(ActionExecutor.EXECUTION_STARTED_EVENT);
                    });
                }
                else
                    this.emit(ActionExecutor.EXECUTION_STARTED_EVENT);

                return automation.run(strictElementCheck);
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
                .catch((err: any) => {
                    if (!this._isExecutionTimeoutExpired())
                        return delay(CHECK_ELEMENT_IN_AUTOMATIONS_INTERVAL);

                    if (err.code === TEST_RUN_ERRORS.actionElementIsNotTargetError) {
                        // If we can't get a target element via elementFromPoint but it's
                        // visible we click on the point where the element is located.
                        strictElementCheck = false;

                        return Promise.resolve();
                    }

                    throw err;
                });
        });
    }

    public execute (barriers: ComplexBarrier<any, any>): Promise<Element[]> {
        this._executionStartTime = nativeMethods.dateNow();

        try {
            // TODO: I think that this check is unnecessary here. It checks only a key sequence of the pressKey command.
            // This check can be moved to the server.
            this._ensureCommandArguments();
        }
        catch (err) {
            return Promise.reject(err);
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
