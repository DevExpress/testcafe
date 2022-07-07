import AxisValues, { AxisValuesData } from '../../utils/values/axis-values';
import * as style from '../../../client/core/utils/style';
import * as positionUtils from '../../../client/core/utils/position';

export default async function convertToClient (element: any, point: AxisValuesData<number>): Promise<AxisValues<number>> {
    const elementScroll = await style.getElementScroll(element);
    const hasScroll     = style.hasScroll(element);

    if (!/html/i.test(element.tagName) && hasScroll) {
        point.x -= elementScroll.left;
        point.y -= elementScroll.top;
    }

    return positionUtils.offsetToClientCoords(point);
}
