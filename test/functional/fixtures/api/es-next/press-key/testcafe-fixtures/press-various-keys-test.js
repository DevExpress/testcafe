import { t } from 'testcafe';
import {
    focusInput,
    getInputValue,
    getEventLog,
    setInputValue,
} from '../common/utils.js';

fixture `Press various keys`
    .page('http://localhost:3000/fixtures/api/es-next/press-key/pages/various-keys.html')
    .beforeEach(async () => {
        await focusInput();
    });

async function checkPressedKeyCombination ({ keyCombination, expectedInputValue, expectedEventLog }) {
    await t
        .pressKey(keyCombination)
        .expect(getInputValue()).eql(expectedInputValue)
        .expect(getEventLog()).eql(expectedEventLog);
}
test('Press literal symbol', async () => {
    await checkPressedKeyCombination({
        keyCombination:     'a',
        expectedInputValue: 'a',
        expectedEventLog:   'keydown: a; keypress: a; keyup: a;',
    });
});

test('Press literal symbol uppercase', async () => {
    await checkPressedKeyCombination({
        keyCombination:     'A',
        expectedInputValue: 'A',
        expectedEventLog:   'keydown: A; keypress: A; keyup: A;',
    });
});

test('Press two literal symbols', async () => {
    await checkPressedKeyCombination({
        keyCombination:     'a+b',
        expectedInputValue: 'ab',
        expectedEventLog:   'keydown: a; keypress: a; keydown: b; keypress: b; keyup: b; keyup: a;',
    });
});
test('Press number key', async () => {
    await checkPressedKeyCombination({
        keyCombination:     '1',
        expectedInputValue: '1',
        expectedEventLog:   'keydown: 1; keypress: 1; keyup: 1;',
    });
});

test('Press special key', async () => {
    await checkPressedKeyCombination({
        keyCombination:     'enter',
        expectedInputValue: '',
        expectedEventLog:   'keydown: Enter; keypress: Enter; keyup: Enter;',
    });
});

test('Press mapped modifier', async () => {
    await checkPressedKeyCombination({
        keyCombination:     'alt',
        expectedInputValue: '',
        expectedEventLog:   'keydown: Alt; keyup: Alt;',
    });
});

test('Shift+a', async () => {
    await checkPressedKeyCombination({
        keyCombination:     'shift+a',
        expectedInputValue: 'A',
        expectedEventLog:   'keydown: Shift; keydown: A; keypress: A; keyup: A; keyup: Shift;',
    });
});

test('Shift+1', async () => {
    await checkPressedKeyCombination({
        keyCombination:     'shift+1',
        expectedInputValue: '!',
        expectedEventLog:   'keydown: Shift; keydown: !; keypress: !; keyup: !; keyup: Shift;',
    });
});

test('Ctrl+a, delete', async () => {
    await setInputValue('abc');

    await t.pressKey('ctrl+a delete');

    await t.expect(getInputValue()).eql('');
});
