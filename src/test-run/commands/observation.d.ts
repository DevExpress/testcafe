import CommandBase from './base';
import TestRun from '../index';

declare class ExecuteClientFunctionCommandBase extends CommandBase {
    public constructor(obj: object, testRun: TestRun, type: string);
    public instantiationCallsiteName: string;
    public fnCode: string;
    public args: string[];
    public dependencies: string[];
}

export class ExecuteClientFunctionCommand extends ExecuteClientFunctionCommandBase {
    public constructor(obj: object, testRun: TestRun);
}

export class ExecuteSelectorCommand extends ExecuteClientFunctionCommandBase {
    public constructor(obj: object, testRun: TestRun);
    public visibilityCheck: boolean;
    public timeout: number;
    public apiFnChain: string[];
    public needError: boolean;
    public index: number;
}

export class WaitCommand extends CommandBase {
    public constructor(obj: object, testRun: TestRun);
    public timeout: number;
}

export class DebugCommand extends CommandBase { }

export class DisableDebugCommand extends CommandBase { }
