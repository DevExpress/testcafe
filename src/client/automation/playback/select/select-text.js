import testCafeCore from '../../deps/testcafe-core';
import SelectBaseAutomation from './base';
import * as selectUtils from './utils';

const textSelection = testCafeCore.textSelection;
const domUtils      = testCafeCore.domUtils;
const positionUtils = testCafeCore.positionUtils;


export default class SelectTextAutomation extends SelectBaseAutomation {
    constructor (element, startPos, endPos, actionOptions) {
        super(element, actionOptions);

        this.startPos = startPos;
        this.endPos   = endPos;
    }

    _calculateAbsoluteStartPoint () {
        const point = selectUtils.getSelectionCoordinatesByPosition(this.element, this.startPos);

        return point || positionUtils.findCenter(this.element);
    }

    _calculateAbsoluteEndPoint () {
        const point = selectUtils.getSelectionCoordinatesByPosition(this.element, this.endPos);

        if (point)
            return point;

        // NOTE: if selection ends on an invisible symbol, we should try to find the last visible selection position
        if (domUtils.isContentEditableElement(this.element))
            return selectUtils.getLastVisibleSelectionPosition(this.element, this.startPos, this.endPos);

        return positionUtils.findCenter(this.element);
    }

    _setSelection () {
        const isTextEditable    = domUtils.isTextEditableElement(this.element);
        const isContentEditable = domUtils.isContentEditableElement(this.element);

        if (!(isTextEditable || isContentEditable) || this.eventState.simulateDefaultBehavior === false)
            return;

        textSelection.select(this.element, this.startPos, this.endPos);
    }

    run (useStrictElementCheck) {
        return this
            ._ensureElement(useStrictElementCheck)
            .then(() => super.run());
    }
}
