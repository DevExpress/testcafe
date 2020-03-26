import { Promise } from '../../../deps/hammerhead';
import { delay } from '../../../deps/testcafe-core';
import ClientFunctionExecutor from '../client-function-executor';
import { exists, visible } from '../../../utils/element-utils';
import { createReplicator, FunctionTransform, SelectorNodeTransform } from '../replicator';
import './filter';
import returnSinglePropMode from '../../../../../client-functions/return-single-prop-mode';

const CHECK_ELEMENT_DELAY = 200;

export default class SelectorExecutor extends ClientFunctionExecutor {
    constructor (command, globalTimeout, startTime, createNotFoundError, createIsInvisibleError) {
        super(command);

        this.createNotFoundError    = createNotFoundError;
        this.createIsInvisibleError = createIsInvisibleError;
        this.timeout                = typeof command.timeout === 'number' ? command.timeout : globalTimeout;
        this.returnSinglePropMode   = returnSinglePropMode(this.dependencies.filterOptions);

        if (startTime) {
            const elapsed = new Date() - startTime;

            this.timeout = Math.max(this.timeout - elapsed, 0);
        }

        const customDOMProperties = this.dependencies && this.dependencies.customDOMProperties;

        this.replicator.addTransforms([new SelectorNodeTransform(customDOMProperties)]);
    }

    _createReplicator () {
        return createReplicator([
            new FunctionTransform()
        ]);
    }

    _getTimeoutErrorParams () {
        const apiFnIndex = window['%testCafeSelectorFilter%'].error;
        const apiFnChain = this.command.apiFnChain;

        if (typeof apiFnIndex !== 'undefined')
            return { apiFnIndex, apiFnChain };

        return null;
    }

    _validateElement (args, startTime) {
        return Promise.resolve()
            .then(() => this.fn.apply(window, args))
            .then(el => {
                const isElementExists    = exists(el);
                const isElementVisible   = !this.command.visibilityCheck || visible(el);
                const createTimeoutError = !isElementExists ? this.createNotFoundError : this.createIsInvisibleError;
                const isTimeout          = new Date() - startTime >= this.timeout;

                if (isElementExists && isElementVisible)
                    return el;

                if (!isTimeout)
                    return delay(CHECK_ELEMENT_DELAY).then(() => this._validateElement(args, startTime));

                if (createTimeoutError)
                    throw createTimeoutError(this._getTimeoutErrorParams());

                return null;
            });
    }

    _executeFn (args) {
        if (this.returnSinglePropMode)
            return super._executeFn(args);

        const startTime = new Date();
        let error     = null;
        let element   = null;

        return this
            ._validateElement(args, startTime)
            .catch(err => {
                error = err;
            })
            .then(el => {
                if (error)
                    throw error;

                element = el;
            })
            .then(() => element);
    }
}
