import { adapter } from '../../adapter';
import AxisValues from '../../utils/values/axis-values';

export default async function getDevicePoint (clientPoint: AxisValues<number>): Promise<AxisValues<number> | null> {
    if (!clientPoint)
        return null;

    return adapter.PromiseCtor.resolve(adapter.position.getWindowPosition())
        .then(windowPosition => {
            const screenLeft = windowPosition.x;
            const screenTop  = windowPosition.y;
            const x          = screenLeft + clientPoint.x;
            const y          = screenTop + clientPoint.y;

            return new AxisValues<number>(x, y);
        });
}
