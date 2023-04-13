// NOTE: to preserve callsites, add new tests AFTER the existing ones
import { ClientFunction, Selector } from 'testcafe';
import { expect } from 'chai';

fixture `Type`
    .page `http://localhost:3000/fixtures/api/es-next/type/pages/index.html`;

const getStatusText = ClientFunction(() => document.getElementById('status').textContent);
const input         = Selector('#input');

test('Type text in input', async t => {
    await t.typeText(input, 'a', { replace: true });

    const statusText = await getStatusText();

    expect(statusText).to.equal('Type in input raised');
});

test('Incorrect action selector', async t => {
    await t.typeText(NaN, 'a');
});

test('Incorrect action text', async t => {
    await t.typeText(input, 123);
});

test('Incorrect action options', async t => {
    await t.typeText(input, 'a', { replace: null, paste: null });
});

test('Not found selector', async t => {
    await t.typeText('#not-found', 'a');
});

test('Enable the `paste` option', async t => {
    await t.typeText(input, 'qwerty', { replace: true, paste: true });
    await t.expect(input.value).eql('qwerty');

    await t.typeText(input, 'qwerty', { replace: false, paste: true });
    await t.expect(input.value).eql('qwertyqwerty');
});
