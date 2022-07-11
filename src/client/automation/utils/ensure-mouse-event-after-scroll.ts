import lastHoveredElementHolder from '../last-hovered-element-holder';
import getDevicePoint from './get-device-point';
import testCafeCore from '../deps/testcafe-core';
import hammerhead from '../deps/hammerhead';
import { MoveBehaviour } from '../playback/move/event-sequence/event-behaviors';

const { positionUtils, domUtils, eventUtils } = testCafeCore;

export default async function ensureMouseEventAfterScroll (currentElement: Element, element: Element, wasScrolled: boolean): hammerhead.Promise<void> {
    const elementUnderCursorContainsTarget = !!currentElement && domUtils.contains(element, currentElement);

    if (!elementUnderCursorContainsTarget || !wasScrolled)
        return;

    const prevElement    = lastHoveredElementHolder.get();
    const commonAncestor = domUtils.getCommonAncestor(currentElement, prevElement);

    const clientPosition = await positionUtils.getClientPosition(currentElement);
    const devicePoint    = await getDevicePoint(clientPosition);

    if (!devicePoint)
        return;

    const options        = {
        clientX: clientPosition.x,
        clientY: clientPosition.y,
        screenX: devicePoint.x,
        screenY: devicePoint.y,
        ctrl:    false,
        alt:     false,
        shift:   false,
        meta:    false,
        buttons: eventUtils.BUTTONS_PARAMETER.leftButton,
    };

    MoveBehaviour.leaveElement(currentElement, prevElement, commonAncestor, options);
    MoveBehaviour.enterElement(currentElement, prevElement, commonAncestor, options);

    lastHoveredElementHolder.set(currentElement);
}
