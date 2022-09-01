import { DevToolsRecorderStep } from '../types';
import TYPE from '../../../../../test-run/commands/type';
import { SelectorCommandTransformerBase } from './selector-base';

class ClickCommandTransformerBase extends SelectorCommandTransformerBase {
    private options: { offsetX?: number; offsetY?: number };

    constructor (step: DevToolsRecorderStep, type: string, callsite: number) {
        super(step, type, callsite);

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

export class ClickCommandTransformer extends ClickCommandTransformerBase {
    constructor (step: DevToolsRecorderStep, callsite: number) {
        super(step, TYPE.click, callsite);
    }
}

export class RightClickCommandTransformer extends ClickCommandTransformerBase {
    constructor (step: DevToolsRecorderStep, callsite: number) {
        super(step, TYPE.rightClick, callsite);
    }
}

export class DoubleClickCommandTransformer extends ClickCommandTransformerBase {
    constructor (step: DevToolsRecorderStep, callsite: number) {
        super(step, TYPE.doubleClick, callsite);
    }
}
