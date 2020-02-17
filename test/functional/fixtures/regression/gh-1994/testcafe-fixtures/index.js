import { Selector } from 'testcafe';

fixture `fixture`
    .page `http://example.com`;

test(`test`, async t => {
    // const sel = await Selector('h1')();

    await t.click('h1');

    // console.log(sel);
});
