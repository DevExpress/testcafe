import { ClientFunction } from 'testcafe';

fixture `Template/Slots/Scrolling`
    .page `http://localhost:3000/fixtures/regression/gh-4222/pages/index.html`;

const isClicked = ClientFunction(() => window.clicked);

test('Template/Slots/Scrolling', async t => {
    await t.click('button');

    await t.expect(isClicked()).eql(true);

});
