import { ExecuteExpressionCommandTransformerBase } from './execute-expression-base';
import { DevToolsRecorderStep } from '../types';

export class WaitForExpressionCommandTransformer extends ExecuteExpressionCommandTransformerBase {
    constructor (step: DevToolsRecorderStep, callsite: number) {
        super(step, callsite);

        this.expression = `
            const fn = ClientFunction(() => {
                return ${step.expression}
            });

            await t.expect(fn()).eql(true);
        `;
    }
}
