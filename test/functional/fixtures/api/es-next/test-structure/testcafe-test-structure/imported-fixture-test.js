import { fixture } from 'testcafe';

fixture `Fixture`;

test('"fixture" should be imported', async t => {
    await t.click('body');
});
