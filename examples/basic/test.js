import { Selector } from 'testcafe';


fixture `A set of examples that illustrate how to use TestCafe API`
    .page `https://devexpress.github.io/testcafe/example/`;

// Page model
const label = Selector('label');

class Feature {
    constructor (text) {
        this.label    = label.withText(text);
        this.checkbox = this.label.find('input[type=checkbox]');
    }
}

class Page {
    constructor () {
        this.nameInput             = Selector('#developer-name');
        this.triedTestCafeCheckbox = Selector('#tried-test-cafe');
        this.populateButton        = Selector('#populate');
        this.submitButton          = Selector('#submit-button');
        this.results               = Selector('.result-content');
        this.macOSRadioButton      = Selector('input[type=radio][value=MacOS]');
        this.commentsTextArea      = Selector('#comments');

        this.featureList = [
            new Feature('Support for testing on remote devices'),
            new Feature('Re-using existing JavaScript code for testing'),
            new Feature('Easy embedding into a Continuous integration system')
        ];

        this.slider = {
            handle: Selector('.ui-slider-handle'),
            tick:   Selector('.slider-value')
        };

        this.interfaceSelect       = Selector('#preferred-interface');
        this.interfaceSelectOption = this.interfaceSelect.find('option');
    }
}

const page = new Page();

// Tests
test('Text typing basics', async t => {
    await t
        .typeText(page.nameInput, 'Peter')                      // Type name
        .typeText(page.nameInput, 'Paker', { replace: true })   // Replace with last name
        .typeText(page.nameInput, 'r', { caretPos: 2 })         // Correct last name
        .expect(page.nameInput.value).eql('Parker');            // Check result
});


test('Click an array of labels and then check their states', async t => {
    for (const feature of page.featureList) {
        await t
            .click(feature.label)
            .expect(feature.checkbox.checked).ok();
    }
});


test('Dealing with text using keyboard', async t => {
    await t
        .typeText(page.nameInput, 'Peter Parker')           // Type name
        .click(page.nameInput, { caretPos: 5 })             // Move caret position
        .pressKey('backspace')                              // Erase a character
        .expect(page.nameInput.value).eql('Pete Parker')    // Check result
        .pressKey('home right . delete delete delete')      // Pick even shorter form for name
        .expect(page.nameInput.value).eql('P. Parker');     // Check result
});


test('Moving the slider', async t => {
    const initialOffset = await page.slider.handle.offsetLeft;

    await t
        .click(page.triedTestCafeCheckbox)
        .dragToElement(page.slider.handle, page.slider.tick.withText('9'))
        .expect(page.slider.handle.offsetLeft).gt(initialOffset);
});


test('Dealing with text using selection', async t => {
    await t
        .typeText(page.nameInput, 'Test Cafe')
        .selectText(page.nameInput, 7, 1)
        .pressKey('delete')
        .expect(page.nameInput.value).eql('Tfe');   // Check result
});


test('Handle native confirmation dialog', async t => {
    await t
        .setNativeDialogHandler(() => true)
        .click(page.populateButton);

    const dialogHistory = await t.getNativeDialogHistory();

    await t.expect(dialogHistory[0].text).eql('Reset information before proceeding?');

    await t
        .click(page.submitButton)
        .expect(page.results.innerText).contains('Peter Parker');
});


test('Pick option from select', async t => {
    await t
        .click(page.interfaceSelect)
        .click(page.interfaceSelectOption.withText('Both'))
        .expect(page.interfaceSelect.value).eql('Both');
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
        .click(page.submitButton)
        .expect(page.results.innerText).contains('Bruce Wayne');
});
