// NOTE: to preserve callsites, add new tests AFTER the existing ones
import { ClientFunction } from 'testcafe';
import { expect } from 'chai';


fixture `PressKey`
    .page `http://localhost:3000/fixtures/api/es-next/press-key/pages/index.html`;

const focusInput    = ClientFunction(() => document.getElementById('input').focus());
const getInputValue = ClientFunction(() => document.getElementById('input').value);

test('Press keys', async t => {
    await focusInput();
    await t.pressKey('right shift+right shift+right delete');
    expect(await getInputValue()).equals('vue');
});

test('Incorrect keys argument', async t => {
    await t.pressKey(false);
});

test('Press key in iframe', async t => {
    await ClientFunction(() => document.getElementById('input').addEventListener('keyup', () => {
        document.getElementById('input').value = 'OK';
    }))();

    await t
        .click('#iframe')
        .pressKey('a');

    expect(await getInputValue()).equals('OK');
});
