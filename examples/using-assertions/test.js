import { Selector } from 'testcafe';

fixture `Use build-in assertions`
    .page `http://devexpress.github.io/testcafe/example/`;

class Page {
    constructor () {
        this.nameInput             = Selector('#developer-name');
        this.checkboxes            = Selector('input[type="checkbox"]');
        this.radioButtons          = Selector('input[type="radio"]');
        this.triedTestCafeCheckbox = this.checkboxes.filter('#tried-test-cafe');
        this.commentsTextArea      = Selector('#comments');
        this.interfaceSelect       = Selector('#preferred-interface');
        this.submitButton          = Selector('#submit-button');

        this.slider = {
            handle: Selector('.ui-slider-handle'),
            tick:   Selector('.slider-value')
        };
    }
}

const page = new Page();

test('Use different assertion types', async t => {
    await t
        .typeText(page.nameInput, 'Peter Parker')
        .expect(page.nameInput.value).contains('Peter')
        .expect(page.nameInput.value).notContains('Potter')

        .expect(page.checkboxes.count).gte(6, 'there are at least six checkboxes on the page')
        .expect(page.radioButtons.count).lte(3, 'there are at most three radio buttons on the page')

        .expect(page.triedTestCafeCheckbox.checked).notOk()
        .click(page.triedTestCafeCheckbox)
        .expect(page.triedTestCafeCheckbox.checked).ok()

        .expect(page.commentsTextArea.value).eql('')
        .typeText(page.commentsTextArea, 'Super!')
        .expect(page.commentsTextArea.value).notEql('Super', 'comments textarea value is not "Super", it is "Super!"')

        .expect(page.interfaceSelect.childElementCount).within(0, 3, 'interface select three options, and this number is within a range between 0 and 2')
        .expect(page.interfaceSelect.find('options').count).notWithin(4, 6, 'interface select three options, and this number is not within a range between 4 and 6')

        .expect(page.submitButton.getStyleProperty('width')).typeOf('string', '"width" style property is string "100px"')
        .expect(page.submitButton.offsetWidth).notTypeOf('string', '"offsetWidth" property is number 100');

    const initialOffset = await page.slider.handle.offsetLeft;

    await t.dragToElement(page.slider.handle, page.slider.tick.withText('9'));

    const newOffset = await page.slider.handle.offsetLeft;

    await t
        .expect(newOffset).gt(initialOffset)
        .dragToElement(page.slider.handle, page.slider.tick.withText('2'))
        .expect(page.slider.handle.offsetLeft).lt(newOffset);
});
