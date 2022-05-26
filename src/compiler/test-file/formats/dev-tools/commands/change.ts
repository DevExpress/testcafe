import { DevToolsRecorderStep } from '../types';
import { ExecuteExpressionCommandTransformerBase } from './execute-expression-base';

export class ChangeCommandTransformer extends ExecuteExpressionCommandTransformerBase {
    constructor (step: DevToolsRecorderStep, callsite: number) {
        super(step, callsite);

        this.expression = `
            const selector = ${this._getCorrectSelector(step)};
            const { tagName } = await selector();

            if (tagName === 'input' || tagName === 'textarea')
                await t.typeText(selector, '${step.value}');
            else if (tagName === 'select') {
                await t.click(selector.find('option').filter(option => {
                    return option.value === '${step.value}';
                }))
            }
        `;
    }
}
