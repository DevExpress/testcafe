import AxisValues, { AxisValuesData } from '../../../core/utils/values/axis-values';

interface CalculateMovePositionOptions {
    startPoint: AxisValuesData<number>;
    endPoint: AxisValuesData<number>;
    needMoveImmediately: boolean;
    distance: AxisValuesData<number>;
    movingTime: number;
}

export default async function mouseMoveStep (
    options: CalculateMovePositionOptions,
    dateNow: () => number,
    callback: (data: AxisValuesData<number>) => Promise<void>): Promise<void> {

    let isFirstStep = true;

    const startPoint = AxisValues.create(options.startPoint);
    const endPoint   = AxisValues.create(options.endPoint).round(Math.floor);
    let currPosition = AxisValues.create(options.startPoint).round(Math.floor);
    let lastPosition = AxisValues.create(options.startPoint);

    const startTime = dateNow();

    while (!currPosition.eql(endPoint)) {
        lastPosition = AxisValues.create(currPosition);

        if (options.needMoveImmediately)
            currPosition = endPoint;

        else if (isFirstStep) {
            isFirstStep = false;

            // NOTE: the mousemove event can't be simulated at the point where the cursor
            // was located at the start. Therefore, we add a minimal distance 1 px.
            // @ts-ignore
            currPosition.add({
                x: options.distance.x > 0 ? 1 : -1,
                y: options.distance.y > 0 ? 1 : -1,
            });
        }
        else {
            const progress = Math.min((dateNow() - startTime) / options.movingTime, 1);

            currPosition = AxisValues.create(options.distance).mul(progress).add(startPoint).round(Math.floor);
        }

        if (!currPosition.eql(lastPosition))
            await callback(currPosition);
    }
}
