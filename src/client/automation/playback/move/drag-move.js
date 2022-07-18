import hammerhead from '../../deps/hammerhead';
import testCafeCore from '../../deps/testcafe-core';
import getElementFromPoint from '../../get-element';
import DragAndDropState from '../drag/drag-and-drop-state';
import createEventSequence from './event-sequence/create-event-sequence';
import lastHoveredElementHolder from '../../last-hovered-element-holder';
import MoveAutomation from './move';
import AxisValues from '../../../core/utils/values/axis-values';

const nativeMethods    = hammerhead.nativeMethods;
const featureDetection = hammerhead.utils.featureDetection;
const htmlUtils        = hammerhead.utils.html;
const urlUtils         = hammerhead.utils.url;
const DataTransfer     = hammerhead.eventSandbox.DataTransfer;
const DragDataStore    = hammerhead.eventSandbox.DragDataStore;

const eventUtils = testCafeCore.eventUtils;
const domUtils   = testCafeCore.domUtils;


// Utils
function findDraggableElement (element) {
    let parentNode = element;

    while (parentNode) {
        if (parentNode.draggable)
            return parentNode;

        parentNode = nativeMethods.nodeParentNodeGetter.call(parentNode);
    }

    return null;
}

export default class DragMoveAutomation extends MoveAutomation {
    constructor (element, offset, moveOptions, win, cursor) {
        super(element, offset, moveOptions, win, cursor);

        this.dragElement      = null;
        this.dragAndDropState = new DragAndDropState();
    }

    static async create (el, moveOptions, win, cursor) {
        const { element, offset } = await MoveAutomation.getTarget(el, win, new AxisValues(moveOptions.offsetX, moveOptions.offsetY));

        return new DragMoveAutomation(element, offset, moveOptions, win, cursor);
    }

    _getCursorSpeed () {
        return this.automationSettings.draggingSpeed;
    }

    _getEventSequenceOptions (currPosition) {
        const { eventOptions, eventSequenceOptions } = super._getEventSequenceOptions(currPosition);

        eventOptions.dataTransfer           = this.dragAndDropState.dataTransfer;
        eventOptions.buttons                = eventUtils.BUTTONS_PARAMETER.leftButton;
        eventSequenceOptions.holdLeftButton = true;

        return { eventOptions, eventSequenceOptions };
    }

    _getCorrectedTopElement (topElement) {
        return this.touchMode ? this.dragElement : topElement;
    }

    _runEventSequence (currentElement, { eventOptions, eventSequenceOptions }) {
        const eventSequence = createEventSequence(this.dragAndDropState.enabled, this.firstMovingStepOccured, eventSequenceOptions);

        const { dragAndDropMode, dropAllowed } = eventSequence.run(
            currentElement,
            lastHoveredElementHolder.get(),
            eventOptions,
            this.dragElement,
            this.dragAndDropState.dataStore
        );

        this.dragAndDropState.enabled     = dragAndDropMode;
        this.dragAndDropState.dropAllowed = dropAllowed;
    }

    _needMoveCursorImmediately () {
        return false;
    }

    run () {
        return getElementFromPoint(this.cursor.getPosition())
            .then(topElement => {
                this.dragElement = topElement;

                const draggable = findDraggableElement(this.dragElement);

                // NOTE: we should skip simulating drag&drop's native behavior if the mousedown event was prevented (GH - 2529)
                if (draggable && featureDetection.hasDataTransfer && !this.skipDefaultDragBehavior) {
                    this.dragAndDropState.enabled      = true;
                    this.dragElement                   = draggable;
                    this.dragAndDropState.element      = this.dragElement;
                    this.dragAndDropState.dataStore    = new DragDataStore();
                    this.dragAndDropState.dataTransfer = new DataTransfer(this.dragAndDropState.dataStore);

                    const isLink = domUtils.isAnchorElement(this.dragElement);

                    if (isLink || domUtils.isImgElement(this.dragElement)) {
                        const srcAttr   = isLink ? 'href' : 'src';
                        const parsedUrl = urlUtils.parseProxyUrl(this.dragElement[srcAttr]);
                        const src       = parsedUrl ? parsedUrl.destUrl : this.dragElement[srcAttr];
                        const outerHTML = htmlUtils.cleanUpHtml(nativeMethods.elementOuterHTMLGetter.call(this.dragElement));

                        this.dragAndDropState.dataTransfer.setData('text/plain', src);
                        this.dragAndDropState.dataTransfer.setData('text/uri-list', src);
                        this.dragAndDropState.dataTransfer.setData('text/html', outerHTML);
                    }
                }

                return super.run()
                    .then(() => this.dragAndDropState);
            });
    }
}
