import { userVariables } from 'testcafe';

fixture `UserVariables write access`;

test
    .before(() => {
        userVariables.executedTests = [];
    })
    .after(async t => {
        await t.expect(userVariables.executedTests).eql(['localhost', 1337, true]);
    })
    ('test', async () => {
        userVariables.executedTests.push('localhost', 1337, true);
    });
