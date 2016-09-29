import { Selector } from 'testcafe';
import { expect } from 'chai';


fixture `A set of examples that illustrate how to use TestCafe API`
    .page `https://devexpress.github.io/testcafe/example/`;


// Page model
const page = {
    nameInput:             Selector('#developer-name'),
    triedTestCafeCheckbox: Selector('#tried-test-cafe'),
    populateButton:        Selector('#populate'),
    submitButton:          Selector('#submit-button'),
    results:               Selector('.result-content'),
    macOSRadioButton:      Selector('input[type=radio][value=MacOS]'),
    commentsTextArea:      Selector('#comments'),

    featureList: [
        {
            checkbox: Selector('#remote-testing'),
            label:    Selector('label', { text: 'Support for testing on remote devices' })
        },
        {
            checkbox: Selector('#reusing-js-code'),
            label:    Selector('label', { text: 'Re-using existing JavaScript code for testing' })
        },
        {
            checkbox: Selector('#continuous-integration-embedding'),
            label:    Selector('label', { text: 'Easy embedding into a Continuous integration system' })
        }
    ],

    slider: {
        handle: Selector('.ui-slider-handle'),
        tick:   Selector('.slider-value')
    },

    interfaceSelect:       Selector('#preferred-interface'),
    interfaceSelectOption: Selector('#preferred-interface > option')
};


// Tests
test('Text typing basics', async t => {
    await t
        .typeText(page.nameInput, 'Peter')                      // Type name
        .typeText(page.nameInput, 'Paker', { replace: true })   // Replace with last name
        .typeText(page.nameInput, 'r', { caretPos: 2 });        // Correct last name

    // Check result
    expect(await page.nameInput.value).eql('Parker');
});


test('Click an array of labels and then check their states', async t => {
    for (const feature of page.featureList) {
        await t.click(feature.label);

        expect(await feature.checkbox.checked).to.be.true;
    }
});


test('Dealing with text using keyboard', async t => {
    await t
        .typeText(page.nameInput, 'Peter Parker')   // Type name
        .click(page.nameInput, { caretPos: 5 })     // Move caret position
        .pressKey('backspace');                     // Erase a character

    // Check result
    expect(await page.nameInput.value).eql('Pete Parker');

    await t.pressKey('home right . delete delete delete'); // Pick even shorter form for name

    // Check result
    expect(await page.nameInput.value).eql('P. Parker');
});


test('Moving the slider', async t => {
    const initialOffset = await page.slider.handle.offsetLeft;

    await t
        .click(page.triedTestCafeCheckbox)
        .dragToElement(page.slider.handle, page.slider.tick.with({ text: '9' }));

    expect(await page.slider.handle.offsetLeft).gt(initialOffset);
});


test('Dealing with text using selection', async t => {
    await t
        .typeText(page.nameInput, 'Test Cafe')
        .selectText(page.nameInput, 7, 1)
        .pressKey('delete');

    // Check result
    expect(await page.nameInput.value).eql('Tfe');
});


test('Handle native confirmation dialog', async t => {
    await t
        .setNativeDialogHandler(() => true)
        .click(page.populateButton);

    const dialogHistory = await t.getNativeDialogHistory();

    expect(dialogHistory[0].text).eql('Reset information before proceeding?');

    await t.click(page.submitButton);

    expect(await page.results.innerText).contains('Peter Parker');
});


test('Pick option from select', async t => {
    await t
        .click(page.interfaceSelect)
        .click(page.interfaceSelectOption.with({ text: 'Both' }));

    expect(await page.interfaceSelect.value).eql('Both');
});


test('Filling a form', async t => {
    // Fill some basic fields
    await t
        .typeText(page.nameInput, 'Bruce Wayne')
        .click(page.macOSRadioButton)
        .click(page.triedTestCafeCheckbox);

    // Let's leave a comment...
    await t
        .typeText(page.commentsTextArea, "It's...")
        .wait(500)
        .typeText(page.commentsTextArea, '\ngood');

    // I guess, I've changed my mind
    await t
        .wait(500)
        .selectTextAreaContent(page.commentsTextArea, 1, 0)
        .pressKey('delete')
        .typeText(page.commentsTextArea, 'awesome!!!');

    // Let's submit our form
    await t
        .wait(500)
        .click(page.submitButton);

    expect(await page.results.innerText).contains('Bruce Wayne');
});
