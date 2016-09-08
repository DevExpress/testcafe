import { Promise } from '../../../deps/hammerhead';
import { delay, positionUtils, domUtils } from '../../../deps/testcafe-core';
import { selectElement as selectElementUI } from '../../../deps/testcafe-ui';
import ClientFunctionExecutor from '../client-function-executor';
import DriverStatus from '../../../status';
import { createReplicator, FunctionTransform, SelectorNodeTransform } from '../replicator';
import './filter';

const CHECK_ELEMENT_DELAY = 200;


// Utils
function exists (el) {
    return !!el;
}

function visible (el) {
    if (!domUtils.isDomElement(el) && !domUtils.isTextNode(el))
        return false;

    if (domUtils.isOptionElement(el) || domUtils.getTagName(el) === 'optgroup')
        return selectElementUI.isOptionElementVisible(el);

    return positionUtils.isElementVisible(el);
}

export default class SelectorExecutor extends ClientFunctionExecutor {
    constructor (command, globalTimeout, startTime, statusBar, createNotFoundError, createIsInvisibleError) {
        super(command);

        this.createNotFoundError    = createNotFoundError;
        this.createIsInvisibleError = createIsInvisibleError;
        this.timeout                = typeof command.timeout === 'number' ? command.timeout : globalTimeout;
        this.statusBar              = statusBar;
        this.counterMode            = this.dependencies.filterOptions.counterMode;

        if (startTime) {
            var elapsed = new Date() - startTime;

            this.timeout = Math.max(this.timeout - elapsed, 0);
        }
    }

    _extendSnapshot (snapshot, node, extensions) {
        Object.keys(extensions).forEach(prop => {
            snapshot[prop] = extensions[prop](node);
        });
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

    _ensureExists (args, startTime) {
        var reCheck = () => this._ensureExists(args, startTime);

        return Promise.resolve()
            .then(() => this.fn.apply(window, args))
            .then(el => this._checkElement(el, startTime, exists, this.createNotFoundError, reCheck));
    }

    _ensureVisible (el, startTime) {
        var reCheck = () => this._ensureVisible(el, startTime);

        return this._checkElement(el, startTime, visible, this.createIsInvisibleError, reCheck);
    }

    _executeFn (args) {
        if (this.counterMode)
            return super._executeFn(args);

        var startTime = new Date();
        var error     = null;
        var element   = null;

        this.statusBar.setWaitingStatus(this.timeout);

        return this
            ._ensureExists(args, startTime)
            .then(el => {
                if (el && this.command.visibilityCheck)
                    return this._ensureVisible(el, startTime);

                return el;
            })
            .catch(err => {
                error = err;

                return this.statusBar.resetWaitingStatus(false);
            })
            .then(el => {
                if (error)
                    throw error;

                element = el;
                return this.statusBar.resetWaitingStatus(!!el);
            })
            .then(() => element);
    }

    getResultDriverStatus () {
        return this
            .getResult()
            .then(result => {
                var node               = result;
                var snapshot           = this.replicator.encode(result)[0];
                var snapshotExtensions = this.dependencies.snapshotExtensions;

                if (snapshotExtensions && node)
                    this._extendSnapshot(snapshot.data, node, snapshotExtensions);

                return new DriverStatus({
                    isCommandResult: true,
                    result:          [snapshot]
                });
            })
            .catch(err => {
                return new DriverStatus({
                    isCommandResult: true,
                    executionError:  err
                });
            });
    }
}
