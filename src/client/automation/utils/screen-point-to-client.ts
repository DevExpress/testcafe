import AxisValues, { AxisValuesData } from '../../core/utils/values/axis-values';
import * as style from '../../core/utils/style';
import * as positionUtils from '../../core/utils/position';
import * as scrollUtils from '../../core/utils/scroll';

export default async function convertToClient (element: any, point: AxisValuesData<number>): Promise<AxisValues<number>> {
    const elementScroll = await style.getElementScroll(element);
    const hasScroll     = scrollUtils.hasScroll(element);

    if (!/html/i.test(element.tagName) && hasScroll) {
        point.x -= elementScroll.left;
        point.y -= elementScroll.top;
    }

    return positionUtils.offsetToClientCoords(point);
}
