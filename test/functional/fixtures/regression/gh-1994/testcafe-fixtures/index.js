import { Selector } from 'testcafe';

fixture `Fixture`
    .page('http://localhost:8080/index.html');

test('test', async t => {
    await t
        .click('a')
        .click('button')
        .expect(Selector('sdf').exists).ok();
});
