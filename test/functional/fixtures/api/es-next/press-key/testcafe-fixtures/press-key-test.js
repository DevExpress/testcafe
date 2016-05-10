// NOTE: to preserve callsites, add new tests AFTER the existing ones
import { Hybrid } from 'testcafe';
import { expect } from 'chai';


fixture `PressKey`
    .page `http://localhost:3000/api/es-next/press-key/pages/index.html`;

const focusInput    = Hybrid(() => document.getElementById('input').focus());
const getInputValue = Hybrid(() => document.getElementById('input').value);

test('Press keys', async t => {
    await focusInput();
    await t.pressKey('right shift+right shift+right delete');
    expect(await getInputValue()).equals('vue');
});

test('Incorrect keys argument', async t => {
    await t.pressKey(false);
});
