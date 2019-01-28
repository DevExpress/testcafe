import { Selector } from 'testcafe';

fixture `Should not raise an error when an iframe is rewritten`
    .page `http://localhost:3000/fixtures/regression/gh-3343/pages/index.html`;

test('Rewrite an iframe', async t => {
    const button = Selector('button');
    const iframe = Selector('iframe');
    const body   = Selector('body');

    await t
        .switchToIframe(iframe)
        .expect(body.innerText).eql('')
        .switchToMainWindow()
        .click(button)
        .switchToIframe(iframe)
        .expect(body.innerText).contains('rewriteCounter === 1')
        .switchToMainWindow()
        .click(button)
        .switchToIframe(iframe)
        .click(body)
        .expect(body.innerText).contains('rewriteCounter === 2');
});
