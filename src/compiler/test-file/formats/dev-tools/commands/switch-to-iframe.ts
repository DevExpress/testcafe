import { DevToolsRecorderStep } from '../types';
import TYPE from '../../../../../test-run/commands/type';
import { SelectorCommandTransformerBase } from './selector-base';

export class SwitchToIframeCommandTransformer extends SelectorCommandTransformerBase {
    constructor (step: DevToolsRecorderStep, callsite: number) {
        super(step, TYPE.switchToIframe, callsite);
    }

    _getCorrectSelector (step: DevToolsRecorderStep): string {
        return `Selector(() => { return window.frames[${step.frame}].frameElement; })`;
    }
}
