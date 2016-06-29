import { Promise } from '../../deps/hammerhead';
import { delay, positionUtils, domUtils } from '../../deps/testcafe-core';
import { ProgressPanel, selectElement as selectElementUI } from '../../deps/testcafe-ui';
import ClientFunctionExecutor from './client-function-executor';
import { createReplicator, FunctionTransform, SelectorNodeTransform } from './replicator';
import { NonDomNodeSelectorResultError } from '../../../../errors/test-run';

const CHECK_ELEMENT_DELAY = 200;
const PROGRESS_PANEL_TEXT = 'Waiting for an element to appear';

// NOTE: save original ctor because it may be overwritten by page code
var Node = window.Node;

function exists (el) {
    return !!el;
}

function visible (el) {
    if (domUtils.isOptionElement(el) || domUtils.getTagName(el) === 'optgroup')
        return selectElementUI.isOptionElementVisible(el);

    return positionUtils.isElementVisible(el);
}

export default class SelectorExecutor extends ClientFunctionExecutor {
    constructor (command, globalTimeout, startTime, createNotFoundError, createIsInvisibleError) {
        super(command);


        this.createNotFoundError    = createNotFoundError;
        this.createIsInvisibleError = createIsInvisibleError;
        this.timeout                = typeof command.timeout === 'number' ? command.timeout : globalTimeout;

        if (startTime) {
            var elapsed = new Date() - startTime;

            this.timeout = Math.max(this.timeout - elapsed, 0);
        }
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
            .then(el => {
                if (!(el instanceof Node) && el !== null && el !== void 0)
                    throw new NonDomNodeSelectorResultError(this.command.instantiationCallsiteName);

                return this._checkElement(el, startTime, exists, this.createNotFoundError, reCheck);
            });
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
