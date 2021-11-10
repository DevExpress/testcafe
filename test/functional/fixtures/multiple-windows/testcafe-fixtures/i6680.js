import { ClientFunction, Selector, RequestLogger } from 'testcafe';

const newWindowUrl = 'http://localhost:3000/fixtures/multiple-windows/pages/i6680/window.html';
const getLocation  = ClientFunction(() => window.location.href);
const logger       = RequestLogger();

fixture `Should switch to child window if parent page has proxied image`
    .page `http://localhost:3000/fixtures/multiple-windows/pages/i6680/index.html`
    .requestHooks(logger);

test('Should switch to child window if parent page has proxied image', async t => {
    const link = Selector('a');

    await t
        .click(link)
        .expect(getLocation()).eql(newWindowUrl);
});
