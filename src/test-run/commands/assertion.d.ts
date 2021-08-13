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
    public static NOT_REPORTED_PROPERTIES: string[];
}

export class Eql extends AssertionCommand {}

export class NotEql extends AssertionCommand {}

export class Ok extends AssertionCommand {}

export class NotOk extends AssertionCommand {}

export class Contains extends AssertionCommand {}

export class NotContains extends AssertionCommand {}

export class TypeOf extends AssertionCommand {}

export class NotTypeOf extends AssertionCommand {}

export class Gt extends AssertionCommand {}

export class Gte extends AssertionCommand {}

export class Lt extends AssertionCommand {}

export class Lte extends AssertionCommand {}

export class Within extends AssertionCommand {}

export class NotWithin extends AssertionCommand {}

export class Match extends AssertionCommand {}

export class NotMatch extends AssertionCommand {}
