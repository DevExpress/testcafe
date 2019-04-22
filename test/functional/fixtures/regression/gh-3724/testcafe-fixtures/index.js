import { Selector } from 'testcafe';

fixture `gh-3724`
    .page `http://localhost:3000/fixtures/regression/gh-3724/pages/index.html`;

test('Type text in an editable iframe', async t => {
    await t
        .switchToIframe('iframe')
        .typeText('body', '123456', { replace: true })
        .expect(Selector('body').innerText).eql('123456');
});
