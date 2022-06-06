import { DevToolsRecorderStep } from '../types';
import { ExecuteExpressionCommandTransformerBase } from './execute-expression-base';

export class WaitForElementCommandTransformer extends ExecuteExpressionCommandTransformerBase {
    constructor (step: DevToolsRecorderStep, callsite: number) {
        super(step, callsite);

        this.expression = `
            const selector = ${this._getCorrectSelector(step)};

            await t.expect(selector.count).${this._getOperatorMethodName(step.operator)}(${step.count || 1});
        `;
    }

    _getOperatorMethodName (operator?: string): string {
        switch (operator) {
            case '>=': return 'gte';
            case '<=': return 'lte';
            case '==': return 'eql';
        }

        return 'gte';
    }
}
