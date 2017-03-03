import { assert, expect } from 'chai';

export default function getFn (command) {
    switch (command.assertionType) {
        case 'eql':
            return () => assert.deepEqual(command.actual, command.expected, command.message);

        case 'notEql':
            return () => assert.notDeepEqual(command.actual, command.expected, command.message);

        case 'ok':
            return () => assert.isOk(command.actual, command.message);

        case 'notOk':
            return () => assert.isNotOk(command.actual, command.message);

        case 'contains':
            return () => assert.include(command.actual, command.expected, command.message);

        case 'notContains':
            return () => assert.notInclude(command.actual, command.expected, command.message);

        case 'typeOf':
            return () => assert.typeOf(command.actual, command.expected, command.message);

        case 'notTypeOf':
            return () => assert.notTypeOf(command.actual, command.expected, command.message);

        case 'gt':
            return () => assert.isAbove(command.actual, command.expected, command.message);

        case 'gte':
            return () => assert.isAtLeast(command.actual, command.expected, command.message);

        case 'lt':
            return () => assert.isBelow(command.actual, command.expected, command.message);

        case 'lte':
            return () => assert.isAtMost(command.actual, command.expected, command.message);

        case 'within':
            return () => expect(command.actual).to.be.within(command.expected, command.expected2, command.message);

        case 'notWithin':
            return () => expect(command.actual).not.to.be.within(command.expected, command.expected2, command.message);

        case 'match':
            return () => assert.match(command.actual, command.expected, command.message);

        case 'notMatch':
            return () => assert.notMatch(command.actual, command.expected, command.message);

        default:
            return () => {
            };
    }
}
