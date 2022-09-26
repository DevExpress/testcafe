import { DEVTOOLS_COMMAND_TYPE, DevToolsRecorderStep } from '../types';
import { NavigateCommandTransformer } from './navigate';
import { SetViewportCommandTransformer } from './set-viewport';
import { ChangeCommandTransformer } from './change';
import { KeyDownCommandTransformer } from './key-down';
import { KeyUpCommandTransformer } from './key-up';
import { ScrollCommandTransformer } from './scroll';
import { WaitForExpressionCommandTransformer } from './wait-for-expression';
import { WaitForElementCommandTransformer } from './wait-for-element';
import { CommandTransformerBase } from './base';
import { HoverCommandTransformer } from './hover';
import { GeneralError } from '../../../../../errors/runtime';
import { RUNTIME_ERRORS } from '../../../../../errors/types';

import {
    ClickCommandTransformer,
    DoubleClickCommandTransformer,
    RightClickCommandTransformer,
} from './click';


const SECONDARY_BUTTON_NAME = 'secondary';

export class CommandTransformerFactory {
    static create (step: DevToolsRecorderStep, filename: string, callsite: number): CommandTransformerBase | null {
        switch (step.type) {
            case DEVTOOLS_COMMAND_TYPE.navigate: return new NavigateCommandTransformer(step, callsite);
            case DEVTOOLS_COMMAND_TYPE.setViewport: return new SetViewportCommandTransformer(step, callsite);
            case DEVTOOLS_COMMAND_TYPE.click: {
                if (step.button === SECONDARY_BUTTON_NAME)
                    return new RightClickCommandTransformer(step, callsite);
                return new ClickCommandTransformer(step, callsite);
            }
            case DEVTOOLS_COMMAND_TYPE.dblClick: return new DoubleClickCommandTransformer(step, callsite);
            case DEVTOOLS_COMMAND_TYPE.hover: return new HoverCommandTransformer(step, callsite);
            case DEVTOOLS_COMMAND_TYPE.change: return new ChangeCommandTransformer(step, callsite);
            case DEVTOOLS_COMMAND_TYPE.keyDown: return new KeyDownCommandTransformer(step, callsite);
            case DEVTOOLS_COMMAND_TYPE.keyUp: return new KeyUpCommandTransformer(step, callsite);
            case DEVTOOLS_COMMAND_TYPE.scroll: return new ScrollCommandTransformer(step, callsite);
            case DEVTOOLS_COMMAND_TYPE.waitForExpression: return new WaitForExpressionCommandTransformer(step, callsite);
            case DEVTOOLS_COMMAND_TYPE.waitForElement: return new WaitForElementCommandTransformer(step, callsite);
            case DEVTOOLS_COMMAND_TYPE.close: return null;
        }

        throw new GeneralError(RUNTIME_ERRORS.invalidCommandInJsonCompiler, filename, step.type);
    }
}
