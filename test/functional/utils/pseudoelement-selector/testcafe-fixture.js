import { Selector } from 'testcafe';

// eslint-disable-next-line no-undef,no-unused-expressions
fixture `Pseudoelement actions`
    .page `./index.html`;

const successMouseStyle = 'background-color: rgb(136, 221, 136);';

test('Сlick on a pseudoelement should works', async t => {
    await t.click('#left-click::after');

    const objectAttributes = await Selector('#left-click').attributes;

    await t.expect(objectAttributes.style).eql(successMouseStyle);
});

test('Right click on a pseudoelement should works', async t => {
    await t.rightClick('#right-click::after');

    const objectAttributes = await Selector('#right-click').attributes;

    await t.expect(objectAttributes.style).eql(successMouseStyle);
});

test('Double click on a pseudoelement should works', async t => {
    await t.doubleClick('#double-click::after');

    const objectAttributes = await Selector('#double-click').attributes;

    await t.expect(objectAttributes.style).eql(successMouseStyle);
});

test('Hovering over a pseudoelement should work', async t => {
    await t.hover('#hover::after');

    const objectAttributes = await Selector('#hover').attributes;

    await t.expect(objectAttributes.style).eql(successMouseStyle);
});

test('Drag a pseudoelement should works', async t => {
    await t.drag('#drag::after', 250, 0);

    const objectAttributes = await Selector('#drag').attributes;
    const leftOffset = parseInt(objectAttributes.style.replace(/\D+/, ''), 10);

    await t.expect(leftOffset).within(200, 300);
});

test('Drag a pseudoelement to another pseudoelement should works', async t => {
    await t.dragToElement('#drag::after', '#timeline::after');

    const objectAttributes = await Selector('#drag').attributes;
    const leftOffset = parseInt(objectAttributes.style.replace(/\D/g, ''), 10);

    await t.expect(leftOffset).within(200, 300);
});

test('Сlick on a pseudoelement with complex selector should works', async t => {
    await t.click('#A > #B > #C > #D::after');

    const objectAttributes = await Selector('#A > #B > #C > #D').attributes;

    await t.expect(objectAttributes.style).eql(successMouseStyle);
});
