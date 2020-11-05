import { Selector } from 'testcafe';

fixture `gh-4793`
    .page `http://localhost:3000/fixtures/regression/gh-4793/pages/index.html`;

test('Type text into an input inside a cross-domain iframe', async t => {
    const iframe = Selector('#cross-domain-iframe', { timeout: 10000 });
    const input  = Selector('#input');

    await t
        .switchToIframe(iframe)
        .typeText(input, '1234')
        .expect(input.value).eql('1234');
});
