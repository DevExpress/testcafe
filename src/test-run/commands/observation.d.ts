import { ActionCommandBase } from './base';
import { ExecuteClientFunctionCommand } from './execute-client-function';
import TestRun from '../index';

export class WaitCommand extends ActionCommandBase {
    public constructor(obj: object, testRun: TestRun);
    public timeout: number;
}

export class DebugCommand extends ActionCommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties?: boolean);
    public selector?: ExecuteClientFunctionCommand;
}
