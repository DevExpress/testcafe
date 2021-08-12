import { ActionCommandBase } from './base';
import { AssertionOptions } from './options';
import TestRun from '../index';

export default class AssertionCommand extends ActionCommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties?: boolean);
    public id: string;
    public assertionType: string;
    public originActual: unknown;
    public actual: unknown;
    public expected: unknown;
    public expected2: unknown;
    public message: string;
    public options: AssertionOptions;
    public static NOT_REPORTED_PROPERTIES: string[];
}
