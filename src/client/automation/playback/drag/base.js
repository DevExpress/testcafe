import hammerhead from '../../deps/hammerhead';
import {
    contentEditable,
    positionUtils,
    domUtils,
    delay
} from '../../deps/testcafe-core';
import { fromPoint as getElementFromPoint } from '../../get-element';
import VisibleElementAutomation from '../visible-element-automation';
import MoveAutomation from '../move';
import { MoveOptions } from '../../../../test-run/commands/options';
import cursor from '../../cursor';

const MIN_MOVING_TIME = 25;

const Promise          = hammerhead.Promise;
const browserUtils     = hammerhead.utils.browser;
const extend           = hammerhead.utils.extend;
const featureDetection = hammerhead.utils.featureDetection;
const eventSimulator   = hammerhead.eventSandbox.eventSimulator;
const focusBlurSandbox = hammerhead.eventSandbox.focusBlur;
const nativeMethods    = hammerhead.nativeMethods;


export default class DragAutomationBase extends VisibleElementAutomation {
    constructor (element, mouseOptions) {
        super(element, mouseOptions);

        this.modifiers = mouseOptions.modifiers;
        this.speed     = mouseOptions.speed;
        this.offsetX   = mouseOptions.offsetX;
        this.offsetY   = mouseOptions.offsetY;

        this.sourceElement           = null;
        this.endPoint                = null;
        this.simulateDefaultBehavior = true;

        this.downEvent = featureDetection.isTouchDevice ? 'touchstart' : 'mousedown';
        this.upEvent   = featureDetection.isTouchDevice ? 'touchend' : 'mouseup';

        this.dragAndDropState = null;
    }

    _getEndPoint () {
        throw new Error('Not implemented');
    }

    _mousedown (eventArgs) {
        return cursor
            .leftButtonDown()
            .then(() => {
                this.simulateDefaultBehavior = eventSimulator[this.downEvent](eventArgs.element, eventArgs.options);
                this.sourceElement = eventArgs.element;

                return this._focus(eventArgs);
            });
    }

    _focus (eventArgs) {
        return new Promise(resolve => {
            // NOTE: If the target element is a child of a contentEditable element, we need to call focus for its parent
            const elementForFocus = domUtils.isContentEditableElement(this.element) ?
                contentEditable.findContentEditableParent(this.element) : eventArgs.element;

            focusBlurSandbox.focus(elementForFocus, resolve, false, true);
        });
    }

    _getDestination () {
        throw new Error('Not implemented');
    }

    _drag () {
        const { element, offsets, endPoint } = this._getDestination();

        this.endPoint = endPoint;

        const dragOptions = new MoveOptions({
            offsetX:                 offsets.offsetX,
            offsetY:                 offsets.offsetY,
            modifiers:               this.modifiers,
            speed:                   this.speed,
            minMovingTime:           MIN_MOVING_TIME,
            holdLeftButton:          true,
            skipDefaultDragBehavior: this.simulateDefaultBehavior === false
        }, false);

        const moveAutomation = new MoveAutomation(element, dragOptions);

        return moveAutomation
            .run()
            .then(dragAndDropState => {
                this.dragAndDropState = dragAndDropState;

                return delay(this.automationSettings.mouseActionStepDelay);
            });
    }

    _mouseup () {
        let upEventCancelled = false;

        return cursor
            .buttonUp()
            .then(() => {
                const point      = positionUtils.offsetToClientCoords(this.endPoint);
                let topElement = null;
                const options    = extend({
                    clientX: point.x,
                    clientY: point.y
                }, this.modifiers);

                return getElementFromPoint(point.x, point.y)
                    .then(({ element }) => {
                        topElement = element;

                        if (!topElement)
                            return topElement;

                        if (this.dragAndDropState.enabled) {
                            options.dataTransfer = this.dragAndDropState.dataTransfer;

                            if (this.dragAndDropState.dropAllowed)
                                eventSimulator.drop(topElement, options);

                            eventSimulator.dragend(this.dragAndDropState.element, options);
                            this.dragAndDropState.dataStore.setProtectedMode();
                        }
                        else
                            upEventCancelled = !eventSimulator[this.upEvent](topElement, options);

                        return getElementFromPoint(point.x, point.y);
                    })
                    .then(({ element }) => {
                        const isTouchendCancelled = featureDetection.isTouchDevice && upEventCancelled;
                        //B231323

                        if (topElement && element === topElement && !this.dragAndDropState.enabled && !isTouchendCancelled) {
                            if (browserUtils.isFirefox || browserUtils.isIE || browserUtils.isMSEdge) {
                                // Firefox, IE and legacy edge trigger a click event if and only if start and end event were triggered on the same target
                                if (this.sourceElement === topElement)
                                    eventSimulator.click(topElement, options);

                            }
                            else {
                                // Chrome, Safari and Chromium Edge trigger a click event on the first common ancestor.
                                const commonAncestor = this._firstCommonAncestor(this.sourceElement, topElement);

                                if (commonAncestor)
                                    eventSimulator.click(commonAncestor, options);

                            }
                        }
                    });
            });
    }

    _firstCommonAncestor (source, target) {
        const sourceParents = this._parents(source);
        const targetParents = this._parents(target);

        if (sourceParents[0] !== targetParents[0]) throw 'The root for source and target is not the same.';

        for (let i = 1; i < sourceParents.length; i++)
            if (sourceParents[i] !== targetParents[i]) return sourceParents[i - 1];

        return sourceParents[sourceParents.length - 1];
    }

    _parents (node) {
        const nodes = [node];

        while (node) {
            nodes.unshift(node);
            node = nativeMethods.nodeParentNodeGetter.call(node);
        }
        return nodes;
    }

    run (useStrictElementCheck) {
        let eventArgs = null;

        return this
            ._ensureElement(useStrictElementCheck)
            .then(({ element, clientPoint }) => {
                eventArgs = {
                    point:   clientPoint,
                    element: element,
                    options: extend({
                        clientX: clientPoint.x,
                        clientY: clientPoint.y
                    }, this.modifiers)
                };

                // NOTE: we should raise start drag with 'mouseActionStepDelay' after we trigger
                // mousedown event regardless of how long mousedown event handlers were executing
                return Promise.all([delay(this.automationSettings.mouseActionStepDelay), this._mousedown(eventArgs)]);
            })
            .then(() => this._drag())
            .then(() => this._mouseup());
    }
}
