import { ActionCommandBase } from './base';
import { AssertionOptions } from './options';
import TestRun from '../index';

export class AssertionCommand extends ActionCommandBase {
    public constructor(obj: object, testRun: TestRun, validateProperties?: boolean);
    public id: string;
    public assertionType: string;
    public originActual: unknown;
    public actual: unknown;
    public expected: unknown;
    public expected2: unknown;
    public message: string;
    public options: AssertionOptions;
}

export class EqlAssertionCommand extends AssertionCommand {}

export class NotEqlAssertionCommand extends AssertionCommand {}

export class OkAssertionCommand extends AssertionCommand {}

export class NotOkAssertionCommand extends AssertionCommand {}

export class ContainsAssertionCommand extends AssertionCommand {}

export class NotContainsAssertionCommand extends AssertionCommand {}

export class TypeOfAssertionCommand extends AssertionCommand {}

export class NotTypeOfAssertionCommand extends AssertionCommand {}

export class GtAssertionCommand extends AssertionCommand {}

export class GteAssertionCommand extends AssertionCommand {}

export class LtAssertionCommand extends AssertionCommand {}

export class LteAssertionCommand extends AssertionCommand {}

export class WithinAssertionCommand extends AssertionCommand {}

export class NotWithinAssertionCommand extends AssertionCommand {}

export class MatchAssertionCommand extends AssertionCommand {}

export class NotMatchAssertionCommand extends AssertionCommand {}
