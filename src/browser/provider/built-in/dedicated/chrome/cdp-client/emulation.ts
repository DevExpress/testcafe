import { getClient } from './clients-manager';
import { AxisValuesData } from '../../../../../../shared/utils/values/axis-values';


export async function move (point: AxisValuesData<number>): Promise<void> {
    await getClient().Input.dispatchMouseEvent({
        type: 'mouseMoved',
        x:    point.x,
        y:    point.y,
    });
}
