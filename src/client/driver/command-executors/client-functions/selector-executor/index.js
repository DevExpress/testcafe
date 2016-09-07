import { Promise } from '../../../deps/hammerhead';
import { delay, positionUtils, domUtils } from '../../../deps/testcafe-core';
import { selectElement as selectElementUI } from '../../../deps/testcafe-ui';
import ClientFunctionExecutor from '../client-function-executor';
import { createReplicator, FunctionTransform, SelectorNodeTransform } from '../replicator';
import { InvalidSelectorResultError } from '../../../../../errors/test-run';
import { getInnerText, getTextContent } from './sandboxed-node-properties';

const CHECK_ELEMENT_DELAY = 200;


// NOTE: save original ctors and methods because they may be overwritten by page code
var Node           = window.Node;
var HTMLCollection = window.HTMLCollection;
var NodeList       = window.NodeList;
var isArray        = Array.isArray;


// Utils
function isArrayOfNodes (obj) {
    if (!isArray(obj))
        return false;

    for (var i = 0; i < obj.length; i++) {
        if (!(obj[i] instanceof Node))
            return false;
    }

    return true;
}

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

function hasText (node, textRe) {
    // Element
    if (node.nodeType === 1)
        return textRe.test(getInnerText(node));

    // Document and DocumentFragment
    if (node.nodeType === 9 || node.nodeType === 11)
        return !!filterNodeCollectionByText(node.childNodes, textRe).length;

    return textRe.test(getTextContent(node));
}

function filterNodeCollectionByText (collection, textRe) {
    var filtered = [];

    for (var i = 0; i < collection.length; i++) {
        if (hasText(collection[i], textRe))
            filtered.push(collection[i]);
    }

    return filtered;
}


// Selector filter
Object.defineProperty(window, '%testCafeSelectorFilter%', {
    value: (node, options) => {
        if (node === null || node === void 0)
            return node;

        if (node instanceof Node) {
            if (options.text)
                return hasText(node, options.text) ? node : null;

            return node;
        }

        if (node instanceof HTMLCollection || node instanceof NodeList || isArrayOfNodes(node)) {
            if (options.text)
                node = filterNodeCollectionByText(node, options.text);

            return node[options.index];
        }

        throw new InvalidSelectorResultError();
    }
});

export default class SelectorExecutor extends ClientFunctionExecutor {
    constructor (command, globalTimeout, startTime, statusBar, createNotFoundError, createIsInvisibleError) {
        super(command);

        this.createNotFoundError    = createNotFoundError;
        this.createIsInvisibleError = createIsInvisibleError;
        this.timeout                = typeof command.timeout === 'number' ? command.timeout : globalTimeout;
        this.statusBar              = statusBar;

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
}
