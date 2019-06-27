import { ClientFunction } from 'testcafe';

const getClicked = ClientFunction(() => {
    return window.clicked;
});

fixture `GH-2601 - Scroll to element when page has elements with negative margin`
    .page `http://localhost:3000/fixtures/regression/gh-2601/pages/index.html`;

test('Scroll to element when page has elements with negative margin', async (t) => {
    await t.click('button');

    const isClicked = await getClicked();

    await t.expect(isClicked).eql(true);

});
