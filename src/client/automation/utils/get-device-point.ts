import AxisValues from '../../core/utils/values/axis-values';
// @ts-ignore
import { Promise } from '../../driver/deps/hammerhead';
import * as positionUtils from '../../core/utils/position';

export default function getDevicePoint (clientPoint: AxisValues<number>): Promise<AxisValues<number> | null> {
    if (!clientPoint)
        return null;

    const windowPosition = positionUtils.getWindowPosition();
    const screenLeft     = windowPosition.x;
    const screenTop      = windowPosition.y;
    const x              = screenLeft + clientPoint.x;
    const y              = screenTop + clientPoint.y;

    return new AxisValues<number>(x, y);
}
