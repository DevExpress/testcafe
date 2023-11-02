import TestRun from '../index';

export class CommandBase {
    public constructor(obj?: object, testRun?: TestRun, type?: string, validateProperties?: boolean);
    public actionId: string;
    public type: string;
    public selector: object;
    [key: string]: unknown;
    public getAssignableProperties(): { name: string }[];
    public getAllAssignableProperties(): { name: string }[];
    public getNonReportedProperties(): string[];
    public getReportedProperties(): string[];
}

export class ActionCommandBase extends CommandBase {
    public static methodName: string;
    public get methodName(): string;
}
