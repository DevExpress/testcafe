import { ExecuteExpressionCommandTransformerBase } from './execute-expression-base';
import { DevToolsRecorderStep } from '../types';

export class KeyUpCommandTransformer extends ExecuteExpressionCommandTransformerBase {
    constructor (step: DevToolsRecorderStep, callsite: number) {
        super(step, callsite);

        this.expression = `
            await t.dispatchEvent(Selector(() => document.activeElement), 'keyup', { key: '${step.key}'});
        `;
    }
}
