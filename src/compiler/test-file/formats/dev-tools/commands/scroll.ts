import { DevToolsRecorderStep } from '../types';
import TYPE from '../../../../../test-run/commands/type';
import { SelectorCommandTransformerBase } from './selector-base';

export class ScrollCommandTransformer extends SelectorCommandTransformerBase {
    private x?: number;
    private y?: number;

    constructor (step: DevToolsRecorderStep, callsite: number) {
        super(step, TYPE.scroll, callsite);

        if (!this.selector)
            this.selector = 'html';

        if (step.x)
            this.x = Math.floor(step.x);

        if (step.y)
            this.y = Math.floor(step.y);
    }

    _getAssignableProperties (): string[] {
        return super._getAssignableProperties().concat(['x', 'y']);
    }
}
