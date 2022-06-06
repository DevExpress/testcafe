import { CommandTransformerBase } from './base';
import { DevToolsRecorderStep } from '../types';
import TYPE from '../../../../../test-run/commands/type';

export class SetViewportCommandTransformer extends CommandTransformerBase {
    private width: unknown;
    private height: unknown;

    constructor (step: DevToolsRecorderStep, callsite: number) {
        super(step, TYPE.resizeWindow, callsite);

        this.width  = step.width;
        this.height = step.height;
    }

    _getAssignableProperties (): string[] {
        return ['width', 'height'];
    }
}
