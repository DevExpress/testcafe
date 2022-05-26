import { ExecuteExpressionCommandTransformerBase } from './execute-expression-base';
import { DevToolsRecorderStep } from '../types';

export class KeyDownCommandTransformer extends ExecuteExpressionCommandTransformerBase {
    constructor (step: DevToolsRecorderStep, callsite: number) {
        super(step, callsite);

        this.expression = `
            await t.dispatchEvent(Selector(() => document.activeElement), 'keydown', { key: '${step.key}'});
            await t.dispatchEvent(Selector(() => document.activeElement), 'keypress', { key: '${step.key}'});
        `;
    }
}
