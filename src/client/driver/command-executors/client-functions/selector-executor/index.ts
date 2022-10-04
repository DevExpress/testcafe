import ClientFunctionExecutor from '../client-function-executor';
import createReplicator from '../replicator/index';
import FunctionTransform from '../replicator/transforms/function-transform';
import SelectorNodeTransform from '../replicator/transforms/selector-node-transform';
import { ExecuteSelectorCommand } from '../../../../../test-run/commands/observation';
import {
    SelectorErrorParams,
    SelectorDependencies,
    SelectorErrorCb,
} from '../types';
import selectorFilter from './filter';
import Replicator from 'replicator';
import * as selectorUtils from './utils';
import CHECK_ELEMENT_DELAY from './check-element-delay';
import {
    // @ts-ignore
    nativeMethods,
    // @ts-ignore
    Promise,
    // @ts-ignore
    utils,
} from '../../../deps/hammerhead';
import delay from '../../../../core/utils/delay';

export default class SelectorExecutor extends ClientFunctionExecutor<ExecuteSelectorCommand, SelectorDependencies> {
    private readonly createNotFoundError: SelectorErrorCb | null;
    private readonly createIsInvisibleError: SelectorErrorCb | null;
    private readonly timeout: number;
    private readonly counterMode: boolean;
    private readonly getVisibleValueMode: boolean;

    public constructor (command: ExecuteSelectorCommand, globalTimeout: number, startTime: number | null,
        createNotFoundError: SelectorErrorCb | null, createIsInvisibleError: SelectorErrorCb | null) {

        super(command);

        this.createNotFoundError    = createNotFoundError;
        this.createIsInvisibleError = createIsInvisibleError;
        this.timeout                = typeof command.timeout === 'number' ? command.timeout : globalTimeout;
        this.counterMode            = this.dependencies.filterOptions.counterMode;
        this.getVisibleValueMode    = this.dependencies.filterOptions.getVisibleValueMode;

        this.dependencies.selectorFilter = selectorFilter;

        if (startTime) {
            const elapsed = nativeMethods.dateNow() - startTime;

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

    private _getTimeoutErrorParams (el?: Node): SelectorErrorParams | null {
        const apiFnIndex = selectorFilter.error;
        const apiFnChain = this.command.apiFnChain;
        const reason     = selectorUtils.getHiddenReason(el);

        return { apiFnIndex, apiFnChain, reason };
    }

    private _getTimeoutError (elementExists: boolean): SelectorErrorCb | null {
        return elementExists ? this.createIsInvisibleError : this.createNotFoundError;
    }

    private _validateElement (args: unknown[], startTime: number): Promise<Node | null> {
        return Promise.resolve()
            .then(() => super._executeFn(args))
            .then((el: unknown) => {
                const element          = el as Node | undefined;
                const isElementExists  = !!element;
                const isElementVisible = !this.command.visibilityCheck || element && selectorUtils.isElementVisible(element);
                const isTimeout        = nativeMethods.dateNow() - startTime >= this.timeout;

                if (isElementExists && (isElementVisible || utils.dom.isShadowRoot(element as Node)))
                    return element as Node;

                if (!isTimeout)
                    return delay(CHECK_ELEMENT_DELAY).then(() => this._validateElement(args, startTime));

                const createTimeoutError = this.getVisibleValueMode ? null : this._getTimeoutError(isElementExists);

                if (createTimeoutError)
                    throw createTimeoutError(this._getTimeoutErrorParams(element));

                return null;
            });
    }

    protected _executeFn (args: unknown[]): Promise<number | Node | null> {
        if (this.counterMode)
            return super._executeFn(args) as Promise<number>;

        return this._validateElement(args, nativeMethods.dateNow());
    }
}
