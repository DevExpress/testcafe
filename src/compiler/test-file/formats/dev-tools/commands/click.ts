import { DevToolsRecorderStep } from '../types';
import TYPE from '../../../../../test-run/commands/type';
import { SelectorCommandTransformerBase } from './selector-base';

export class ClickCommandTransformer extends SelectorCommandTransformerBase {
    private options: { offsetX?: number; offsetY?: number };

    constructor (step: DevToolsRecorderStep, callsite: number) {
        super(step, TYPE.click, callsite);

        this.options = {};

        if (step.offsetX)
            this.options.offsetX = Math.floor(step.offsetX);

        if (step.offsetY)
            this.options.offsetY = Math.floor(step.offsetY);
    }

    _getAssignableProperties (): string[] {
        return super._getAssignableProperties().concat(['options']);
    }
}
