import CommandBase from '../test-run/commands/base';
import TestRun from '../test-run';

export interface ActionEventArg {
    apiActionName: string;
    command: CommandBase;
    testRun?: TestRun;
}
