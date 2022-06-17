import { ExecuteExpressionCommandTransformerBase } from './execute-expression-base';
import { DevToolsRecorderStep } from '../types';

export class WaitForExpressionCommandTransformer extends ExecuteExpressionCommandTransformerBase {
    constructor (step: DevToolsRecorderStep, callsite: number) {
        super(step, callsite);

        const expression = this._escapeSpecialCharacters(step.expression);

        this.expression = `
            const fn = ClientFunction(() => {
                return ${expression}
            });

            await t.expect(fn()).eql(true);
        `;
    }
}
