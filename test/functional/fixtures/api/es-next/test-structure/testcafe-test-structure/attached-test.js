import { fixture, test, Selector } from 'testcafe';

fixture `Attached tests`;

test('Attached tests should work', async t => {
    await t.expect(Selector('body').exists).ok();
});
