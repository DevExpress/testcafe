import hammerhead from '../../../deps/hammerhead';
import { domUtils } from '../../../deps/testcafe-core';

var browserUtils = hammerhead.utils.browser;

export default class MoveEventSequenceBase {
    constructor () {
        this.dragAndDropMode = false;
        this.dropAllowed     = false;
    }

    setup () {
        this.dragAndDropMode = false;
        this.dropAllowed     = false;
    }

    leaveElement (/* currentElement, prevElement, commonAncestor, options */) {
    }

    move (/* element, options, moveEvent */) {
    }

    enterElement (/* currentElement, prevElement, commonAncestor, options */) {
    }

    dragAndDrop (/* dragElement, currentElement, prevElement, options, dragDataStore */) {
    }

    teardown (/* currentElement, eventOptions, prevElement, moveEvent */) {
    }

    run (currentElement, prevElement, options, moveEvent, dragElement, dragDataStore) {
        // NOTE: if last hovered element was in an iframe that has been removed, IE
        // raises an exception when we try to compare it with the current element
        var prevElementInDocument = prevElement && domUtils.isElementInDocument(prevElement);

        var prevElementInRemovedIframe = prevElement && domUtils.isElementInIframe(prevElement) &&
                                         !domUtils.getIframeByElement(prevElement);

        if (!prevElementInDocument || prevElementInRemovedIframe)
            prevElement = null;

        var elementChanged = currentElement !== prevElement;
        var commonAncestor = elementChanged ? domUtils.getCommonAncestor(currentElement, prevElement) : null;

        this.setup();

        if (elementChanged && !!prevElement)
            this.leaveElement(currentElement, prevElement, commonAncestor, options);

        if (browserUtils.isIE)
            this.move(currentElement, options, moveEvent);

        if (elementChanged && domUtils.isElementInDocument(currentElement))
            this.enterElement(currentElement, prevElement, commonAncestor, options);

        if (!browserUtils.isIE)
            this.move(currentElement, options, moveEvent);

        this.dragAndDrop(dragElement, currentElement, prevElement, options, dragDataStore);
        this.teardown(currentElement, options, prevElement, moveEvent);

        var dragAndDropMode = this.dragAndDropMode;
        var dropAllowed     = this.dropAllowed;

        this.dragAndDropMode = false;
        this.dropAllowed     = false;

        return { dragAndDropMode, dropAllowed };
    }
}
