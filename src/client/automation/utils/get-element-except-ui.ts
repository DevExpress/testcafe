import testCafeCore from '../deps/testcafe-core';
import testCafeUI from '../deps/testcafe-ui';
import { AxisValuesData } from '../../core/utils/values/axis-values';


const positionUtils = testCafeCore.positionUtils;

export default function getElementFromPoint (point: AxisValuesData<number>, underTopShadowUIElement = false): Promise<HTMLElement> {
    return testCafeUI.hide(underTopShadowUIElement)
        .then(() => {
            const topElement = positionUtils.getElementFromPoint(point);

            return testCafeUI.show(underTopShadowUIElement)
                .then(() => topElement);
        });
}
