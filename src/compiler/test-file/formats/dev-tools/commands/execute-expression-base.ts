import { CommandTransformerBase } from './base';
import { DevToolsRecorderStep } from '../types';
import TYPE from '../../../../../test-run/commands/type';

export class ExecuteExpressionCommandTransformerBase extends CommandTransformerBase {
    protected expression = '';

    constructor (step: DevToolsRecorderStep, callsite: number) {
        super(step, TYPE.executeAsyncExpression, callsite);
    }

    _getAssignableProperties (): string[] {
        return ['expression'];
    }
}
