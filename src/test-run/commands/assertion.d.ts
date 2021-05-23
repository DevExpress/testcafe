import CommandBase from './base';
import { AssertionOptions } from './options';

interface AssertionCommand extends CommandBase {
    options: AssertionOptions;
}

declare const AssertionCommand: AssertionCommand;

export default AssertionCommand;
