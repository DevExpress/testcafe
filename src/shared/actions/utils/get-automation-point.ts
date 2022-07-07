import AxisValues, { AxisValuesData } from '../../utils/values/axis-values';
// @ts-ignore
import { Promise, utils } from '../../../client/core/deps/hammerhead';
import * as domUtils from '../../../client/core/utils/dom';
import * as positionUtils from '../../../client/core/utils/position';

export default function getAutomationPoint<E> (element: E, offset: AxisValuesData<number>): Promise<AxisValues<number>> {
    return Promise.resolve(domUtils.isDocumentElement(element))
        .then((isDocEl: boolean) => {
            if (isDocEl)
                return new AxisValues(0, 0);

            const roundFn = utils.browser.isFirefox ? Math.ceil : Math.round;

            return Promise.resolve(positionUtils.getOffsetPosition(element, roundFn))
                .then((elementOffset: any) => AxisValues.create(elementOffset));
        })
        .then((point: any) => point.add(offset));
}
