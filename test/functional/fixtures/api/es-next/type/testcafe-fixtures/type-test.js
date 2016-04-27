// NOTE: to preserve callsites, add new tests AFTER the existing ones
import { Hybrid } from 'testcafe';
import { expect } from 'chai';

fixture `Type`
    .page `http://localhost:3000/api/es-next/type/pages/index.html`;

const getStatusText = Hybrid(() => document.getElementById('status').textContent);

test('Type text in input', async t => {
    await t.typeText('#input', 'a', { replace: true });

    var statusText = await getStatusText();

    expect(statusText).to.equal('Type in input raised');
});

test('Incorrect action selector', async t => {
    await t.typeText(NaN, 'a');
});

test('Incorrect action text', async t => {
    await t.typeText('#input', 123);
});

test('Incorrect action option', async t => {
    await t.typeText('#input', 'a', { replace: null });
});
