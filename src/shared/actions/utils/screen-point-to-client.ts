import { adapter } from '../../adapter';
import AxisValues, { AxisValuesData } from '../../utils/values/axis-values';

export default async function convertToClient (element: any, point: AxisValuesData<number>): Promise<AxisValues<number>> {
    const elementScroll = await adapter.style.getElementScroll(element);
    const hasScroll     = await adapter.style.hasScroll(element);

    if (!/html/i.test(element.tagName) && hasScroll) {
        point.x -= elementScroll.left;
        point.y -= elementScroll.top;
    }

    return adapter.position.offsetToClientCoords(point);
}
