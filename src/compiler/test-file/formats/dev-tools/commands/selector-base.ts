import { CommandTransformerBase } from './base';
import { DevToolsRecorderStep } from '../types';

export class SelectorCommandTransformerBase extends CommandTransformerBase {
    protected selector?: object | string;

    constructor (step: DevToolsRecorderStep, type: string, callsite: number) {
        super(step, type, callsite);

        const selector = this._getCorrectSelector(step);

        if (selector) {
            this.selector = {
                type:  'js-expr',
                value: selector,
            };
        }
    }

    _getAssignableProperties (): string[] {
        return ['selector'];
    }
}
