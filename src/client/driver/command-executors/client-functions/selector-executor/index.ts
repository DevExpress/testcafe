import ClientFunctionExecutor from '../client-function-executor';
import {
    createReplicator,
    FunctionTransform,
    SelectorNodeTransform,
} from '../replicator';
import { ExecuteSelectorCommand } from '../../../../../test-run/commands/observation';
import {
    FnInfo,
    SelectorDependencies,
    SelectorErrorCb,
} from '../types';
import selectorFilter from './filter';
import Replicator from 'replicator';
import adapter from '../adapter/index';
import { visible } from '../../../utils/element-utils';


const CHECK_ELEMENT_DELAY = 200;


export default class SelectorExecutor extends ClientFunctionExecutor<ExecuteSelectorCommand, SelectorDependencies> {
    private readonly createNotFoundError: SelectorErrorCb | null;
    private readonly createIsInvisibleError: SelectorErrorCb | null;
    private readonly timeout: number;
    private readonly counterMode: boolean;
    private readonly getVisibleValueMode: boolean;

    public constructor (command: ExecuteSelectorCommand, globalTimeout: number,
        startTime: number | null, createNotFoundError: SelectorErrorCb | null, createIsInvisibleError: SelectorErrorCb | null) {

        super(command);

        this.createNotFoundError    = createNotFoundError;
        this.createIsInvisibleError = createIsInvisibleError;
        this.timeout                = typeof command.timeout === 'number' ? command.timeout : globalTimeout;
        this.counterMode            = this.dependencies.filterOptions.counterMode;
        this.getVisibleValueMode    = this.dependencies.filterOptions.getVisibleValueMode;

        this.dependencies.selectorFilter = selectorFilter;

        if (startTime) {
            const elapsed = adapter.nativeMethods.dateNow() - startTime;

            this.timeout = Math.max(this.timeout - elapsed, 0);
        }

        const customDOMProperties = this.dependencies.customDOMProperties;

        this.replicator.addTransforms([
            new SelectorNodeTransform(customDOMProperties, command.instantiationCallsiteName),
        ]);
    }

    protected _createReplicator (): Replicator {
        return createReplicator([
            new FunctionTransform(),
        ]);
    }

    private _getTimeoutErrorParams (): FnInfo | null {
        const apiFnIndex = selectorFilter.error;
        const apiFnChain = this.command.apiFnChain;

        if (apiFnIndex !== null)
            return { apiFnIndex, apiFnChain };

        return null;
    }

    private _getTimeoutError (elementExists: boolean): SelectorErrorCb | null {
        return elementExists ? this.createIsInvisibleError : this.createNotFoundError;
    }

    private _validateElement (args: unknown[], startTime: number): Promise<Node | null> {
        return adapter.PromiseCtor.resolve()
            .then(() => super._executeFn(args))
            .then((el: unknown) => {
                const element          = el as Node | undefined;
                const isElementExists  = !!element;
                const isElementVisible = !this.command.visibilityCheck || element && visible(element);
                const isTimeout        = adapter.nativeMethods.dateNow() - startTime >= this.timeout;

                if (isElementExists && (isElementVisible || adapter.isShadowRoot(element as Node)))
                    return element as Node;

                if (!isTimeout)
                    return adapter.delay(CHECK_ELEMENT_DELAY).then(() => this._validateElement(args, startTime));

                const createTimeoutError = this.getVisibleValueMode ? null : this._getTimeoutError(isElementExists);

                if (createTimeoutError)
                    throw createTimeoutError(this._getTimeoutErrorParams());

                return null;
            });
    }

    protected _executeFn (args: unknown[]): Promise<number | Node | null> {
        if (this.counterMode)
            return super._executeFn(args) as Promise<number>;

        return this._validateElement(args, adapter.nativeMethods.dateNow());
    }
}
