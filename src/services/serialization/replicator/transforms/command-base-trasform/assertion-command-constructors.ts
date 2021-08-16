import {
    Contains,
    Eql,
    Gt,
    Gte,
    Lt,
    Lte,
    Match,
    NotContains,
    NotEql,
    NotMatch,
    NotOk,
    NotTypeOf,
    NotWithin,
    Ok,
    TypeOf,
    Within,
} from '../../../../../test-run/commands/assertion';
import { CommandConstructor } from './types';
import AssertionType from '../../../../../assertions/type';


const ASSERTION_COMMAND_CONSTRUCTORS = new Map<string, CommandConstructor>([
    [AssertionType.eql, Eql],
    [AssertionType.notEql, NotEql],
    [AssertionType.ok, Ok],
    [AssertionType.notOk, NotOk],
    [AssertionType.contains, Contains],
    [AssertionType.notContains, NotContains],
    [AssertionType.typeOf, TypeOf],
    [AssertionType.notTypeOf, NotTypeOf],
    [AssertionType.gt, Gt],
    [AssertionType.gte, Gte],
    [AssertionType.lt, Lt],
    [AssertionType.lte, Lte],
    [AssertionType.within, Within],
    [AssertionType.notWithin, NotWithin],
    [AssertionType.match, Match],
    [AssertionType.notMatch, NotMatch],
]);

export default ASSERTION_COMMAND_CONSTRUCTORS;
