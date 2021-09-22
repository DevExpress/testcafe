import { test, Selector } from 'testcafe';

fixture `Test`;

test('"test" should be imported', async t => {
    await t.expect(Selector('body').exists).ok();
});
