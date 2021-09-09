import {
    ContainsAssertionCommand,
    EqlAssertionCommand,
    GtAssertionCommand,
    GteAssertionCommand,
    LtAssertionCommand,
    LteAssertionCommand,
    MatchAssertionCommand,
    NotContainsAssertionCommand,
    NotEqlAssertionCommand,
    NotMatchAssertionCommand,
    NotOkAssertionCommand,
    NotTypeOfAssertionCommand,
    NotWithinAssertionCommand,
    OkAssertionCommand,
    TypeOfAssertionCommand,
    WithinAssertionCommand,
} from '../../../../../test-run/commands/assertion';
import { CommandConstructor } from './types';
import AssertionType from '../../../../../assertions/type';


const ASSERTION_COMMAND_CONSTRUCTORS = new Map<string, CommandConstructor>([
    [AssertionType.eql, EqlAssertionCommand],
    [AssertionType.notEql, NotEqlAssertionCommand],
    [AssertionType.ok, OkAssertionCommand],
    [AssertionType.notOk, NotOkAssertionCommand],
    [AssertionType.contains, ContainsAssertionCommand],
    [AssertionType.notContains, NotContainsAssertionCommand],
    [AssertionType.typeOf, TypeOfAssertionCommand],
    [AssertionType.notTypeOf, NotTypeOfAssertionCommand],
    [AssertionType.gt, GtAssertionCommand],
    [AssertionType.gte, GteAssertionCommand],
    [AssertionType.lt, LtAssertionCommand],
    [AssertionType.lte, LteAssertionCommand],
    [AssertionType.within, WithinAssertionCommand],
    [AssertionType.notWithin, NotWithinAssertionCommand],
    [AssertionType.match, MatchAssertionCommand],
    [AssertionType.notMatch, NotMatchAssertionCommand],
]);

export default ASSERTION_COMMAND_CONSTRUCTORS;
