import testCafeCore from '../../deps/testcafe-core';
import * as selectUtils from './utils';
import SelectBaseAutomation from './base';

var textSelection   = testCafeCore.textSelection;
var contentEditable = testCafeCore.contentEditable;
var positionUtils   = testCafeCore.positionUtils;


export default class SelectEditableContentAutomation extends SelectBaseAutomation {
    constructor (startNode, endNode, actionOptions) {
        super(contentEditable.getNearestCommonAncestor(startNode, endNode), actionOptions);

        var startOffset = contentEditable.getFirstVisiblePosition(startNode);
        var endOffset   = contentEditable.getLastVisiblePosition(endNode);

        var startPos      = { node: startNode, offset: startOffset };
        var endPos        = { node: endNode, offset: endOffset };
        var startPosition = contentEditable.calculatePositionByNodeAndOffset(this.element, startPos);
        var endPosition   = contentEditable.calculatePositionByNodeAndOffset(this.element, endPos);

        if (startPosition > endPosition) {
            startOffset = contentEditable.getLastVisiblePosition(startNode);
            endOffset   = contentEditable.getFirstVisiblePosition(endNode);
        }

        // NOTE: We should recalculate nodes and offsets for selection because we
        // may have to select children of expectedStartNode and expectedEndNode
        startPos = contentEditable.calculateNodeAndOffsetByPosition(startNode, startOffset);
        endPos   = contentEditable.calculateNodeAndOffsetByPosition(endNode, endOffset);

        this.startNode   = startPos.node;
        this.startOffset = startPos.offset;
        this.endNode     = endPos.node;
        this.endOffset   = endPos.offset;
    }

    _calculateAbsoluteStartPoint () {
        var point = selectUtils.getSelectionCoordinatesByNodeAndOffset(this.element, this.startNode, this.startOffset);

        return point || positionUtils.findCenter(this.element);
    }

    _calculateAbsoluteEndPoint () {
        var point = selectUtils.getSelectionCoordinatesByNodeAndOffset(this.element, this.endNode, this.endOffset);

        return point || positionUtils.findCenter(this.element);
    }

    _setSelection () {
        if (this.eventState.simulateDefaultBehavior === false)
            return;

        // NOTE: The same cursor position may correspond to different nodes, so, if we
        // know which nodes should be selected eventually, we should select them directly.
        var startPos = { node: this.startNode, offset: this.startOffset };
        var endPos   = { node: this.endNode, offset: this.endOffset };

        textSelection.selectByNodesAndOffsets(startPos, endPos, true);
    }
}
