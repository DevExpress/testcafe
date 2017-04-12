import { expect } from 'chai';
import { ClientFunction } from 'testcafe';

fixture `gh-913`
    .page `http://localhost:3000/fixtures/regression/gh-913/pages/index.html`;

const getWindowScrollTop = ClientFunction(() => window.pageYOffset);

test("Shouldn't scroll to target parent while performing click", async t => {
    const oldWindowScrollValue = await getWindowScrollTop();

    await t.click('#child');

    const newWindowScrollValue = await getWindowScrollTop();

    expect(newWindowScrollValue).eql(oldWindowScrollValue);
});
