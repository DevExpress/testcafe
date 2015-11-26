import testCafeCore from '../deps/testcafe-core';
import scrollPlaybackAutomation from './playback/scroll';

var domUtils      = testCafeCore.domUtils;
var positionUtils = testCafeCore.positionUtils;
var styleUtils    = testCafeCore.styleUtils;


export function setScroll (iFrameWin, point, actionOptions, callback) {
    var iFrame  = domUtils.getIframeByWindow(iFrameWin),
        target  = point ? positionUtils.getFixedPosition(point, iFrameWin, true) : iFrame,
        options = point ? null : actionOptions;

    scrollPlaybackAutomation(target, options, null, callback);
}

export function getScrollData (iFrameWin) {
    var iFrame = domUtils.getIframeByWindow(iFrameWin);

    return {
        scroll:        styleUtils.getElementScroll(domUtils.findDocument(document)),
        iFrameOffset:  positionUtils.getOffsetPosition(iFrame),
        iFrameBorders: styleUtils.getBordersWidth(iFrame),
        iFramePadding: styleUtils.getElementPadding(iFrame)
    };
}
