import AxisValues from '../../utils/values/axis-values';
// @ts-ignore
import { Promise } from '../../../client/driver/deps/hammerhead';
import * as positionUtils from '../../../client/core/utils/position';

export default async function getDevicePoint (clientPoint: AxisValues<number>): Promise<AxisValues<number> | null> {
    if (!clientPoint)
        return null;

    return Promise.resolve(positionUtils.getWindowPosition())
        .then((windowPosition: any) => {
            const screenLeft = windowPosition.x;
            const screenTop  = windowPosition.y;
            const x          = screenLeft + clientPoint.x;
            const y          = screenTop + clientPoint.y;

            return new AxisValues<number>(x, y);
        });
}
