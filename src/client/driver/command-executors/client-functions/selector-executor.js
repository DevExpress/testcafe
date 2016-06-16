import { Promise } from '../../deps/hammerhead';
import { delay, positionUtils } from '../../deps/testcafe-core';
import { ProgressPanel } from '../../deps/testcafe-ui';
import ClientFunctionExecutor from './client-function-executor';
import { createReplicator, FunctionTransform, SelectorNodeTransform } from './replicator';

const CHECK_ELEMENT_DELAY = 200;
const PROGRESS_PANEL_TEXT = 'Waiting for an element to appear';

function exists (el) {
    return !!el;
}

function visible (el) {
    return positionUtils.isElementVisible(el);
}

export default class SelectorExecutor extends ClientFunctionExecutor {
    constructor (command, timeout, createNotFoundError, createIsInvisibleError) {
        super(command);


        this.createNotFoundError    = createNotFoundError;
        this.createIsInvisibleError = createIsInvisibleError;
        this.timeout                = typeof command.timeout === 'number' ? command.timeout : timeout;
    }

    _createReplicator () {
        return createReplicator([
            new SelectorNodeTransform(),
            new FunctionTransform()
        ]);
    }

    _checkElement (el, startTime, condition, createTimeoutError, reCheck) {
        if (condition(el))
            return el;

        var isTimeout = new Date() - startTime >= this.timeout;

        if (isTimeout) {
            if (createTimeoutError)
                throw createTimeoutError();

            return null;
        }

        return delay(CHECK_ELEMENT_DELAY).then(reCheck);
    }

    _ensureExists (fn, args, startTime) {
        var reCheck = () => this._ensureExists(fn, args, startTime);

        return Promise.resolve()
            .then(() => fn.apply(window, args))
            .then(el => this._checkElement(el, startTime, exists, this.createNotFoundError, reCheck));
    }

    _ensureVisible (el, startTime) {
        var reCheck = () => this._ensureVisible(el, startTime);

        return this._checkElement(el, startTime, visible, this.createIsInvisibleError, reCheck);
    }

    _executeFn (fn, args) {
        var startTime     = new Date();
        var progressPanel = new ProgressPanel();

        progressPanel.show(PROGRESS_PANEL_TEXT, this.timeout);

        return this
            ._ensureExists(fn, args, startTime)
            .then(el => {
                if (el && this.command.visibilityCheck)
                    return this._ensureVisible(el, startTime);

                return el;
            })
            .catch(err => {
                progressPanel.close(false);
                throw err;
            })
            .then(el => {
                progressPanel.close(!!el);
                return el;
            });
    }
}
