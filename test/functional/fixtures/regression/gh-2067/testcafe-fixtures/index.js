import { Selector } from 'testcafe';

fixture `GH-2067`
    .page `http://localhost:3000/fixtures/regression/gh-2067/pages/index.html`;

const radioWindows = Selector('#windows');
const radioMacos   = Selector('#macos');
const radioLinux   = Selector('#linux');
const radioAndroid = Selector('#android');

const radioFord  = Selector('#ford');
const radioBmw   = Selector('#bmw');
const radioMazda = Selector('#mazda');
const radioHonda = Selector('#honda');

async function checkRadio (t, radio, condition) {
    await t.expect(radio.focused).eql(condition);
    await t.expect(radio.checked).eql(condition);
}

const radioButtonsOS   = [radioMacos, radioLinux, radioAndroid, radioWindows, radioMacos];
const radioButtonsCars = [radioBmw, radioMazda, radioHonda, radioFord, radioBmw];

async function testRadioButtons (t, key, radios) {
    await t.click(radios[0]);

    for (let i = 0; i < radios.length; i++) {
        await checkRadio(t, radios[i], true);
        await t.pressKey(key);
    }
}

async function testRadioButtonsNonamed (t, key, radios) {
    await t.click(radios[0]);

    for (let i = 1; i < radios.length - 1; i++) {
        await checkRadio(t, radios[0], true);
        await checkRadio(t, radios[i], false);
        await t.pressKey(key);
    }
}

test('named', async t => {
    await testRadioButtons(t, 'down', radioButtonsOS);
    await testRadioButtons(t, 'right', radioButtonsOS);
    await testRadioButtons(t, 'up', [...radioButtonsOS].reverse());
    await testRadioButtons(t, 'up', [...radioButtonsOS].reverse());
});

test('nonamed - chrome', async t => {
    await testRadioButtons(t, 'down', radioButtonsCars);
    await testRadioButtons(t, 'right', radioButtonsCars);
    await testRadioButtons(t, 'up', [...radioButtonsCars].reverse());
    await testRadioButtons(t, 'up', [...radioButtonsCars].reverse());
});

test('nonamed - ie, firefox', async t => {
    await testRadioButtonsNonamed(t, 'down', radioButtonsCars);
    await testRadioButtonsNonamed(t, 'right', radioButtonsCars);
    await testRadioButtonsNonamed(t, 'up', [...radioButtonsCars].reverse());
    await testRadioButtonsNonamed(t, 'up', [...radioButtonsCars].reverse());
});

test('Should select the checked radio button by pressing the tab key', async t => {
    await t
        .click(Selector('#check1'))
        .pressKey('tab')
        .expect(radioWindows.focused).ok()
        .expect(radioWindows.checked).notOk()

        .pressKey('right')
        .expect(radioMacos.focused).ok()
        .expect(radioMacos.checked).ok()

        .click(Selector('#check1'))
        .pressKey('tab')
        .expect(radioMacos.focused).ok()
        .expect(radioMacos.checked).ok();
});
