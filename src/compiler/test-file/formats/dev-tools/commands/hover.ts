import { DevToolsRecorderStep } from '../types';
import TYPE from '../../../../../test-run/commands/type';
import { SelectorCommandTransformerBase } from './selector-base';

export class HoverCommandTransformer extends SelectorCommandTransformerBase {
    constructor (step: DevToolsRecorderStep, callsite: number) {
        super(step, TYPE.hover, callsite);
    }
}
