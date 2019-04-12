import { Selector } from 'testcafe';

fixture `Non-exising and invisible iframes`
    .page `http://localhost:3000/fixtures/regression/gh-3681/pages/index.html`;

test('Invisible iframe', async t => {
    await t.switchToIframe(Selector('iframe'));
});

test('Non-existing iframe', async t => {
    await t.switchToIframe(Selector('non-existing-iframe'));
});
