import testCafeCore from '../../deps/testcafe-core';

var domUtils        = testCafeCore.domUtils;
var contentEditable = testCafeCore.contentEditable;


function getSelectTextAreaContentArguments (element, argumentsObject) {
    var value         = domUtils.getTextAreaValue(element);
    var linesArray    = value && value.length ? value.split('\n') : [];
    var lastLineIndex = linesArray.length - 1;

    var startLineIndex  = !argumentsObject.startLine ? 0 : Math.min(argumentsObject.startLine, lastLineIndex);
    var startLineLength = linesArray[startLineIndex] ? linesArray[startLineIndex].length : 0;
    var startPos        = !argumentsObject.startPos ? 0 : Math.min(argumentsObject.startPos, startLineLength);

    var endLineIndex = argumentsObject.endLine === void 0 || argumentsObject.endLine === null ?
        lastLineIndex : Math.min(argumentsObject.endLine, lastLineIndex);

    var endLineLength = linesArray[endLineIndex] ? linesArray[endLineIndex].length : 0;
    var endPos        = argumentsObject.endPos === void 0 ||
                        argumentsObject.endPos ===
                        null ? endLineLength : Math.min(argumentsObject.endPos, endLineLength);

    var startLinePosition = domUtils.getTextareaPositionByLineAndOffset(element, startLineIndex, 0);
    var endLinePosition   = domUtils.getTextareaPositionByLineAndOffset(element, endLineIndex, 0);

    return {
        startPos: startLinePosition + startPos,
        endPos:   endLinePosition + endPos
    };
}

export default function (element, argumentsObject = {}) {
    var isTextEditable = domUtils.isTextEditableElement(element);
    var firstPos       = isTextEditable ? 0 : contentEditable.getFirstVisiblePosition(element);
    var lastPos        = isTextEditable ? domUtils.getElementValue(element).length : contentEditable.getLastVisiblePosition(element);
    var startPos       = !argumentsObject.startPos ? firstPos : Math.min(argumentsObject.startPos, lastPos);
    var endPos         = argumentsObject.endPos === void 0 ||
                         argumentsObject.endPos === null ? lastPos : Math.min(argumentsObject.endPos, lastPos);

    if (argumentsObject.offset !== void 0) {
        if (argumentsObject.offset >= 0)
            endPos = Math.min(argumentsObject.offset, endPos);
        else {
            startPos = endPos;
            endPos   = Math.max(0, endPos + argumentsObject.offset);
        }

        return { startPos, endPos };
    }

    if (argumentsObject.startLine !== void 0)
        return getSelectTextAreaContentArguments(element, argumentsObject);

    return { startPos, endPos };
}
