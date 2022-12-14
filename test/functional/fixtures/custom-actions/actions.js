const { Selector } = require('../../../../lib/api/exportable-lib');

async function clickBySelector (selector) {
    await this.click(selector);
}

async function getSpanTextBySelector (selector) {
    return await Selector(selector).innerText;
}

async function typeTextAndClickButton (inputSelector, buttonSelector, inputText) {
    await this.typeText(inputSelector, inputText).click(buttonSelector);
}

async function typeToInputAndCheckResult (inputSelector, buttonSelector, resultSelector, inputText) {
    await this.customActions.typeTextAndClickButton(inputSelector, buttonSelector, inputText)
        .expect(await this.customActions.getSpanTextBySelector(resultSelector)).eql(inputText);
}

function getTextValue () {
    return 'some text';
}

module.exports = {
    getSpanTextBySelector,
    clickBySelector,
    typeTextAndClickButton,
    typeToInputAndCheckResult,
    getTextValue,
};
