import { DevToolsRecorderStep } from '../types';
import { ExecuteExpressionCommandTransformerBase } from './execute-expression-base';

export class ChangeCommandTransformer extends ExecuteExpressionCommandTransformerBase {
    constructor (step: DevToolsRecorderStep, callsite: number) {
        super(step, callsite);

        const value = this._escapeSpecialCharacters(step.value);

        this.expression = `
            const selector = ${this._getCorrectSelector(step)};
            const { tagName } = await selector();

            if (tagName === 'input' || tagName === 'textarea')
                await t.typeText(selector, '${value}', { replace: true });
            else if (tagName === 'select') {
                await t.click(selector.find('option').filter(option => {
                    return option.value === '${value}';
                }))
            }
        `;
    }
}
