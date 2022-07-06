import { adapter } from '../../adapter';
import AxisValues, { AxisValuesData } from '../../utils/values/axis-values';
// @ts-ignore
import { Promise, utils } from '../../../client/core/deps/hammerhead';

export default function getAutomationPoint<E> (element: E, offset: AxisValuesData<number>): Promise<AxisValues<number>> {
    return Promise.resolve(adapter.dom.isDocumentElement(element))
        .then((isDocEl: boolean) => {
            if (isDocEl)
                return new AxisValues(0, 0);

            const roundFn = utils.browser.isFirefox ? Math.ceil : Math.round;

            return Promise.resolve(adapter.position.getOffsetPosition(element, roundFn))
                .then((elementOffset: any) => AxisValues.create(elementOffset));
        })
        .then((point: any) => point.add(offset));
}
