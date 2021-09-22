import { fixture, Selector } from 'testcafe';

fixture `Fixture`;

test('"fixture" should be imported', async t => {
    await t.expect(Selector('body').exists).ok();
});
