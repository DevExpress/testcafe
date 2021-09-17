import { test } from 'testcafe';

fixture `Test`;

test('"test" should be imported', async t => {
    await t.click('body');
});
