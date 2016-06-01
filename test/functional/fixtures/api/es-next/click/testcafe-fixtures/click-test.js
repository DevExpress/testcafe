// NOTE: to preserve callsites, add new tests AFTER the existing ones

import { expect } from 'chai';
import { Hybrid } from 'testcafe';

fixture `Click`
    .page `http://localhost:3000/api/es-next/click/pages/index.html`;

const getClickOffset = Hybrid(() => window.clickOffset);

test('Incorrect action selector', async t => {
    await t.click(123);
});

test('Incorrect action option', async t => {
    await t.click('#btn', { offsetX: -3 });
});

test('Click button', async t => {
    await t.click('#btn');
});

test('Click without offset options', async t=> {
    await t.click('#div');

    var expectedClickOffset = { x: 50, y: 50 };
    var actualClickOffset   = await getClickOffset();

    expect(actualClickOffset.x).eql(expectedClickOffset.x);
    expect(actualClickOffset.y).eql(expectedClickOffset.y);
});
