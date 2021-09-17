import { fixture, test } from 'testcafe';

fixture `Attached tests`;

test('Attached tests should work', async t => {
    await t.click('body');
});
