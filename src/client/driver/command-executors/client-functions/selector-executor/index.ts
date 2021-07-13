// @ts-ignore
import { Promise, nativeMethods } from '../../../deps/hammerhead';
// @ts-ignore
import { delay, domUtils } from '../../../deps/testcafe-core';
import ClientFunctionExecutor from '../client-function-executor';
import { visible } from '../../../utils/element-utils';
import {
    createReplicator,
    FunctionTransform,
    SelectorNodeTransform,
} from '../replicator';
import { ExecuteSelectorCommand } from '../../../../../test-run/commands/observation';
import { CommandExecutorsAdapterBase } from '../../../../proxyless/command-executors-adapter-base';
import {
    FnInfo,
    SelectorDependencies,
    SelectorErrorCb,
} from './types';
import SelectorFilter from './filter';
import Replicator from 'replicator';


const dateNow = nativeMethods.dateNow;

const CHECK_ELEMENT_DELAY = 200;

export default class SelectorExecutor extends ClientFunctionExecutor<ExecuteSelectorCommand, SelectorDependencies> {
    private readonly createNotFoundError: SelectorErrorCb | null;
    private readonly createIsInvisibleError: SelectorErrorCb | null;
    private readonly timeout: number;
    private readonly counterMode: boolean;
    private readonly getVisibleValueMode: boolean;

    public constructor (command: ExecuteSelectorCommand, commandExecutorsAdapter: CommandExecutorsAdapterBase, globalTimeout: number,
        startTime: number | null, createNotFoundError: SelectorErrorCb | null, createIsInvisibleError: SelectorErrorCb | null) {

        super(command, commandExecutorsAdapter);

        this.createNotFoundError    = createNotFoundError;
        this.createIsInvisibleError = createIsInvisibleError;
        this.timeout                = typeof command.timeout === 'number' ? command.timeout : globalTimeout;
        this.counterMode            = this.dependencies.filterOptions.counterMode;
        this.getVisibleValueMode    = this.dependencies.filterOptions.getVisibleValueMode;

        if (startTime) {
            const elapsed = dateNow() - startTime;

            this.timeout = Math.max(this.timeout - elapsed, 0);
        }

        const customDOMProperties = this.dependencies.customDOMProperties;

        this.replicator.addTransforms([
            new SelectorNodeTransform(customDOMProperties, command.instantiationCallsiteName, commandExecutorsAdapter),
        ]);
    }

    protected _createReplicator (): Replicator {
        return createReplicator([
            new FunctionTransform(this.adapter),
        ]);
    }

    private _getTimeoutErrorParams (): FnInfo | null {
        // @ts-ignore
        const apiFnIndex = (window['%testCafeSelectorFilter%'] as SelectorFilter).error;
        const apiFnChain = this.command.apiFnChain; // TODO: in this line "string[]" but "(string | number)[]" in other

        if (apiFnIndex !== null)
            return { apiFnIndex, apiFnChain };

        return null;
    }

    private _getTimeoutError (elementExists: boolean): SelectorErrorCb | null {
        return elementExists ? this.createIsInvisibleError : this.createNotFoundError;
    }

    private _validateElement (args: unknown[], startTime: number): Promise<Node | null> {
        return Promise.resolve()
            .then(() => super._executeFn(args))
            .then((el: Node | undefined) => {
                const isElementExists  = !!el;
                const isElementVisible = !this.command.visibilityCheck || el && visible(el);
                const isTimeout        = dateNow() - startTime >= this.timeout;

                if (isElementExists && (isElementVisible || domUtils.isShadowRoot(el)))
                    return el;

                if (!isTimeout)
                    return delay(CHECK_ELEMENT_DELAY).then(() => this._validateElement(args, startTime));

                const createTimeoutError = this.getVisibleValueMode ? null : this._getTimeoutError(isElementExists);

                if (createTimeoutError)
                    throw createTimeoutError(this._getTimeoutErrorParams());

                return null;
            });
    }

    protected _executeFn (args: unknown[]): Promise<number | Node | null> {
        if (this.counterMode)
            return super._executeFn(args);

        return this._validateElement(args, dateNow());
    }
}
