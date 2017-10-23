import { Selector } from 'testcafe';

fixture `GH-1875`
    .page `http://localhost:3000/fixtures/regression/gh-1875/pages/index.html`;

test('gh-1875', async t => {
    await t
        .switchToIframe('#iframe')
        .expect(Selector('body').visible).ok('iframe is loaded');

    const { log } = await t.getBrowserConsoleMessages();

    await t.expect(log[0]).eql('log message 1');
});
