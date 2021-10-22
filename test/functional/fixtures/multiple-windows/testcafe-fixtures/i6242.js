import { ClientFunction, Selector } from 'testcafe';

const page = 'http://localhost:3000/fixtures/multiple-windows/pages/i6242/index.html';

const getLocation = ClientFunction(() => window.location.href);

fixture `Download in separate window`
    .page(page);

test('Download in separate window', async t => {
    const downloadButton = Selector('a');

    await t
        .click(downloadButton)
        .expect(getLocation()).eql(page)
        .click(downloadButton)
        .expect(getLocation()).eql(page)
        .openWindow(page);
});
