import { assert, expect } from 'chai';
import ASSERTION_TYPE from './type';

export default function getFn (command) {
    switch (command.assertionType) {
        case ASSERTION_TYPE.eql:
            return () => assert.deepEqual(command.actual, command.expected, command.message);

        case ASSERTION_TYPE.notEql:
            return () => assert.notDeepEqual(command.actual, command.expected, command.message);

        case ASSERTION_TYPE.ok:
            return () => assert.isOk(command.actual, command.message);

        case ASSERTION_TYPE.notOk:
            return () => assert.isNotOk(command.actual, command.message);

        case ASSERTION_TYPE.contains:
            return () => assert.include(command.actual, command.expected, command.message);

        case ASSERTION_TYPE.notContains:
            return () => assert.notInclude(command.actual, command.expected, command.message);

        case ASSERTION_TYPE.typeOf:
            return () => assert.typeOf(command.actual, command.expected, command.message);

        case ASSERTION_TYPE.notTypeOf:
            return () => assert.notTypeOf(command.actual, command.expected, command.message);

        case ASSERTION_TYPE.gt:
            return () => assert.isAbove(command.actual, command.expected, command.message);

        case ASSERTION_TYPE.gte:
            return () => assert.isAtLeast(command.actual, command.expected, command.message);

        case ASSERTION_TYPE.lt:
            return () => assert.isBelow(command.actual, command.expected, command.message);

        case ASSERTION_TYPE.lte:
            return () => assert.isAtMost(command.actual, command.expected, command.message);

        case ASSERTION_TYPE.within:
            return () => expect(command.actual).to.be.within(command.expected, command.expected2, command.message);

        case ASSERTION_TYPE.notWithin:
            return () => expect(command.actual).not.to.be.within(command.expected, command.expected2, command.message);

        case ASSERTION_TYPE.match:
            return () => assert.match(command.actual, command.expected, command.message);

        case ASSERTION_TYPE.notMatch:
            return () => assert.notMatch(command.actual, command.expected, command.message);

        default:
            return () => {
            };
    }
}
