import TYPE from '../../../../../test-run/commands/type';
import { DevToolsRecorderStep } from '../types';
import { CommandTransformerBase } from './base';

export class SwitchToMainWindowCommandTransformer extends CommandTransformerBase {
    constructor (step: DevToolsRecorderStep, callsite: number) {
        super(step, TYPE.switchToMainWindow, callsite);
    }
}
