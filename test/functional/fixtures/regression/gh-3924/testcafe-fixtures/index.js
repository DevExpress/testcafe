import { ClientFunction } from 'testcafe';

fixture `GH-3924 - Scroll to element overlapped by TestCafe panel`
    .page`http://localhost:3000/fixtures/regression/gh-3924/pages/index.html`;

const getClicked = ClientFunction(() => {
    return window.clicked;
});

test(`Click button`, async t => {
    await t.click('button');

    const clicked = await getClicked();

    await t.expect(clicked).eql(true);
});
