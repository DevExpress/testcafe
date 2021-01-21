import { Selector } from 'testcafe';

fixture `Selector for element after switching to the rewritten iframe`
    .page `http://localhost:3000/fixtures/regression/gh-5886/pages/index.html`;

test('Should exist', async t => {
    await t
        .switchToIframe('#frame')
        .expect(Selector('#test').withText('The Test Text').exists).ok();
});
