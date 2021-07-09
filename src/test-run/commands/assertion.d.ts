import CommandBase from './base';
import { AssertionOptions } from './options';
import TestRun from '../index';

export default class AssertionCommand extends CommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties?: boolean);
    public id: string;
    public assertionType: string;
    public actual: unknown;
    public expected: unknown;
    public expected2: unknown;
    public message: string;
    public options: AssertionOptions;
}
