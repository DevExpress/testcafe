import { userVariables } from 'testcafe';
import { expect } from 'chai';

fixture `UserVariables write access`
    .before(() => {
        userVariables.executedTests = [];
    })
    .after(() => {
        expect(userVariables.executedTests).eql(['localhost', 1337, true]);
    });

test('test', async () => {
    userVariables.executedTests.push('localhost');
    userVariables.executedTests.push(1337);
    userVariables.executedTests.push(true);
});
