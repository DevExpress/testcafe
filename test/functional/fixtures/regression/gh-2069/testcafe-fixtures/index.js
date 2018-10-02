import { ClientFunction } from 'testcafe';

fixture `GH-2069 - Scroll to fully visible element`
    .page `http://localhost:3000/fixtures/regression/gh-2069/pages/index.html`;

const getScrollY = ClientFunction(() => window.scrollY);

test('Should not scroll parent container if target element is already fully visible', async t => {
    const currentScrollY = await getScrollY();

    await t.click('#target');
    await t.expect(getScrollY()).eql(currentScrollY);
});
