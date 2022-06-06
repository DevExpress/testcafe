import { CommandTransformerBase } from './base';
import { DevToolsRecorderStep } from '../types';
import TYPE from '../../../../../test-run/commands/type';

export class NavigateCommandTransformer extends CommandTransformerBase {
    private url: string;

    constructor (step: DevToolsRecorderStep, callsite: number) {
        super(step, TYPE.navigateTo, callsite);

        this.url = step.url as string;
    }

    _getAssignableProperties (): string[] {
        return ['url'];
    }
}
