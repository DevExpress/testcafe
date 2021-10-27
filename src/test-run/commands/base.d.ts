import TestRun from '../index';

export class CommandBase {
    public constructor(obj?: object, testRun?: TestRun, type?: string, validateProperties?: boolean);
    public actionId: string;
    public type: string;
    [key: string]: unknown;
    public _getAssignableProperties(): { name: string }[];
}

export class ActionCommandBase extends CommandBase {
    public static methodName: string;
    public get methodName(): string;
}
