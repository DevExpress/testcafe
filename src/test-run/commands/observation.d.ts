import { ActionCommandBase } from './base';
import TestRun from '../index';

export class WaitCommand extends ActionCommandBase {
    public constructor(obj: object, testRun: TestRun);
    public timeout: number;
}

export class DebugCommand extends ActionCommandBase { }
