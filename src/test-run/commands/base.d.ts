import TestRun from '../index';

export default class CommandBase {
    public constructor(obj?: object, testRun?: TestRun, type?: string, validateProperties?: boolean);
    public type: string;
    [key: string]: unknown;
    public _getAssignableProperties(): { name: string }[];
}
