import { Selector } from 'testcafe';

fixture `[Regression](GH-4848) - Should focus next element if current element has negative tabIndex`
    .page `http://localhost:3000/fixtures/regression/gh-4848/pages/index.html`;

const body = Selector('body');
const ft1  = Selector('#ft1');
const ft5  = Selector('#ft5');
const a    = Selector('a');

test(`Straight order. Middle`, async t => {
    await t.pressKey('tab');
    await t.expect(Selector(a).focused).eql(true);
});

test(`Reversed order. Middle`, async t => {
    await t.pressKey('shift+tab');
    await t.expect(Selector('#target1').focused).eql(true);
});

test(`Reversed order. Last`, async t => {
    await t.click(ft5);
    await t.pressKey('shift+tab');
    await t.expect(Selector('#target4').focused).eql(true);
});

test(`Straight order. First`, async t => {
    await t.click(ft1);
    await t.pressKey('tab');
    await t.expect(a.focused).eql(true);
});

test(`Reversed order. First`, async t => {
    await t.click(ft1);
    await t.pressKey('shift+tab');
    await t.expect(body.focused).eql(true);
});

test(`Straight order. Last`, async t => {
    await t.click(ft5);
    await t.pressKey('tab');
    await t.expect(Selector('#target1').focused).eql(true);

    await t.click(ft1); // NOTE: make tabIndex of `target1` to -1
    await t.click(ft5);
    await t.pressKey('tab');
    await t.expect(Selector(a).focused).eql(true);
});
