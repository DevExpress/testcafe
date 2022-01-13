import { adapter } from '../../adapter';
import AxisValues, { AxisValuesData } from '../../utils/values/axis-values';


export default function getAutomationPoint<E> (element: E, offset: AxisValuesData<number>): Promise<AxisValues<number>> {
    return adapter.PromiseCtor.resolve(adapter.dom.isDocumentElement(element))
        .then(isDocEl => {
            if (isDocEl)
                return new AxisValues(0, 0);

            const roundFn = adapter.browser.isFirefox ? Math.ceil : Math.round;

            return adapter.PromiseCtor.resolve(adapter.position.getOffsetPosition(element, roundFn))
                .then(elementOffset => AxisValues.create(elementOffset));
        })
        .then(point => point.add(offset));
}
