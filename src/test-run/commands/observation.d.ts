import { CommandBase, ActionCommandBase } from './base';
import TestRun from '../index';

declare class ExecuteClientFunctionCommandBase extends CommandBase {
    public constructor(obj: object, testRun: TestRun, type: string);
    public instantiationCallsiteName: string;
    public fnCode: string;
    public args: string[];
    public dependencies: string[];
    public esmRuntime: string;
}

export class ExecuteClientFunctionCommand extends ExecuteClientFunctionCommandBase {
    public constructor(obj: object, testRun: TestRun);
}

export class ExecuteSelectorCommand extends ExecuteClientFunctionCommandBase {
    public constructor(obj: object, testRun: TestRun);
    public visibilityCheck: boolean;
    public timeout?: number;
    public apiFnChain: string[];
    public needError: boolean;
    public index: number;
    public strictError: boolean;
}

export class WaitCommand extends ActionCommandBase {
    public constructor(obj: object, testRun: TestRun);
    public timeout: number;
}

export class DebugCommand extends ActionCommandBase { }

export class DisableDebugCommand extends ActionCommandBase { }
