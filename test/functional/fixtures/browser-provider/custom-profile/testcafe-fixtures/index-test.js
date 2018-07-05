import { ClientFunction } from 'testcafe';

fixture `Custom user profile`;

const checkIsEqual = ClientFunction(() => 42 === 42);

test('Test', async t => {
    await t.expect(checkIsEqual).ok();
});
