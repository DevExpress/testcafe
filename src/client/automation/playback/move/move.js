import hammerhead from '../../deps/hammerhead';
import testCafeCore from '../../deps/testcafe-core';
import { MoveOptions } from '../../../../test-run/commands/options';
import cursor from '../../cursor';


import getLineRectIntersection from './get-line-rect-intersection';

import lastHoveredElementHolder from '../../last-hovered-element-holder';
import AxisValues from '../../../core/utils/values/axis-values';

import MoveAutomation from '../../move';

const eventSimulator   = hammerhead.eventSandbox.eventSimulator;
const messageSandbox   = hammerhead.eventSandbox.message;

const positionUtils      = testCafeCore.positionUtils;
const domUtils           = testCafeCore.domUtils;
const styleUtils         = testCafeCore.styleUtils;

const MOVE_REQUEST_CMD  = 'automation|move|request';
const MOVE_RESPONSE_CMD = 'automation|move|response';

function onMoveToIframeRequest (e) {
    const iframePoint                 = new AxisValues(e.message.endX, e.message.endY);
    const iframeWin                   = e.source;
    const iframe                      = domUtils.findIframeByWindow(iframeWin);
    const iframeBorders               = styleUtils.getBordersWidth(iframe);
    const iframePadding               = styleUtils.getElementPadding(iframe);
    const iframeRectangle             = positionUtils.getIframeClientCoordinates(iframe);
    const iframePointRelativeToParent = positionUtils.getIframePointRelativeToParentFrame(iframePoint, iframeWin);
    const cursorPosition              = cursor.getPosition();

    cursor.shouldRender = e.message.shouldRender;

    const intersectionPoint = positionUtils.isInRectangle(cursorPosition, iframeRectangle) ? cursorPosition :
        getLineRectIntersection(cursorPosition, iframePointRelativeToParent, iframeRectangle);

    const intersectionRelatedToIframe = {
        x: intersectionPoint.x - iframeRectangle.left,
        y: intersectionPoint.y - iframeRectangle.top,
    };

    const moveOptions = new MoveOptions({
        modifiers: e.message.modifiers,
        offsetX:   intersectionRelatedToIframe.x + iframeBorders.left + iframePadding.left,
        offsetY:   intersectionRelatedToIframe.y + iframeBorders.top + iframePadding.top,
        speed:     e.message.speed,

        // NOTE: we should not perform scrolling because the active window was
        // already scrolled to the target element before the request (GH-847)
        skipScrolling: true,
    }, false);

    const responseMsg = {
        cmd: MOVE_RESPONSE_CMD,
        x:   intersectionRelatedToIframe.x,
        y:   intersectionRelatedToIframe.y,
    };

    if (cursor.getActiveWindow(window) !== iframeWin) {
        // const moveAutomation = new MoveAutomation(iframe, moveOptions);
        MoveAutomation.create(iframe, moveOptions, window, cursor)
            .then(moveAutomation => {
                return moveAutomation.run();
            })
            .then(() => {
                cursor.setActiveWindow(iframeWin);

                messageSandbox.sendServiceMsg(responseMsg, iframeWin);
            });
    }
    else
        messageSandbox.sendServiceMsg(responseMsg, iframeWin);
}

function onMoveOutRequest (e) {
    const parentWin = e.source;

    const iframeRectangle = {
        left:   e.message.left,
        right:  e.message.right,
        top:    e.message.top,
        bottom: e.message.bottom,
    };

    if (!e.message.iframeUnderCursor) {
        const { startX, startY } = e.message;

        const clientX = startX - iframeRectangle.left;
        const clientY = startY - iframeRectangle.top;

        // NOTE: We should not emulate mouseout and mouseleave if iframe was reloaded.
        const element = lastHoveredElementHolder.get();

        if (element) {
            eventSimulator.mouseout(element, { clientX, clientY, relatedTarget: null });
            eventSimulator.mouseleave(element, { clientX, clientY, relatedTarget: null });
        }

        messageSandbox.sendServiceMsg({ cmd: MOVE_RESPONSE_CMD }, parentWin);

        return;
    }

    const cursorPosition    = cursor.getPosition();
    const startPoint        = AxisValues.create(iframeRectangle).add(cursorPosition);
    const endPoint          = new AxisValues(e.message.endX, e.message.endY);
    const intersectionPoint = getLineRectIntersection(startPoint, endPoint, iframeRectangle);

    // NOTE: We should not move the cursor out of the iframe if
    // the cursor path does not intersect with the iframe borders.
    if (!intersectionPoint) {
        messageSandbox.sendServiceMsg({
            cmd: MOVE_RESPONSE_CMD,
            x:   iframeRectangle.left,
            y:   iframeRectangle.top,
        }, parentWin);

        return;
    }

    const moveOptions = new MoveOptions({
        modifiers: e.message.modifiers,
        offsetX:   intersectionPoint.x - iframeRectangle.left,
        offsetY:   intersectionPoint.y - iframeRectangle.top,
        speed:     e.message.speed,

        // NOTE: we should not perform scrolling because the active window was
        // already scrolled to the target element before the request (GH-847)
        skipScrolling: true,
    }, false);

    MoveAutomation.create(document.documentElement, moveOptions, window, cursor)
        .then(moveAutomation => {
            return moveAutomation.run();
        })
        .then(() => {
            const responseMsg = {
                cmd: MOVE_RESPONSE_CMD,
                x:   intersectionPoint.x,
                y:   intersectionPoint.y,
            };

            cursor.setActiveWindow(parentWin);
            messageSandbox.sendServiceMsg(responseMsg, parentWin);
        });
}

// Setup cross-iframe interaction
messageSandbox.on(messageSandbox.SERVICE_MSG_RECEIVED_EVENT, e => {
    if (e.message.cmd === MOVE_REQUEST_CMD) {
        if (e.source.parent === window)
            onMoveToIframeRequest(e);
        else {
            hammerhead.on(hammerhead.EVENTS.beforeUnload, () => messageSandbox.sendServiceMsg({ cmd: MOVE_RESPONSE_CMD }, e.source));

            onMoveOutRequest(e);
        }
    }
});

export default MoveAutomation;
