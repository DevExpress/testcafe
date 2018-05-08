import { Selector } from 'testcafe';

fixture('GH-1956 - Should support TextInput event')
    .page `http://localhost:3000/fixtures/regression/gh-1956/pages/index.html`;

const simpleInput                    = Selector('#simpleInput');
const simpleContentEditable          = Selector('#simpleContentEditable');
const contentEditableWithElementNode = Selector('#contentEditableWithElementNode');
const contentEditableWithModify      = Selector('#contentEditableWithModify');
const contentEditableWithReplace     = Selector('#contentEditableWithReplace');

// NOTE: Chrome/Edge/Safari. Typing is prevented and Input event is not raised
test('Prevent Input event on TextInput when type to input element', async t => {
    await t
        .typeText(simpleInput, 'Hello')
        .expect(simpleInput.value).eql('');
});

// NOTE: IE11/Firefox. Typing is not prevented. Input event is raised
test('Prevent Input event on TextInput when type to input element IE11/Firefox', async t => {
    await t
        .typeText(simpleInput, 'Hello')
        .expect(simpleInput.value).eql('Hello');
});

// NOTE: Chrome/Edge/Safari. Typing is prevented. Input event is not raised
test('Prevent Input event on TextInput when type to ContentEditable div', async t => {
    await t
        .typeText(simpleContentEditable, 'Hello')
        .expect(simpleContentEditable.textContent).eql('');
});

// NOTE: IE11/Firefox. Typing is not prevented.
// Input event is raised in firefox but is not raised in IE11 - it's a IE11 bug
test('Prevent Input event on TextInput when type to ContentEditable div IE11/Firefox', async t => {
    await t
        .typeText(simpleContentEditable, 'Hello')
        .expect(simpleContentEditable.textContent).eql('Hello');
});

// NOTE: Not for IE11 because preventDefault will not prevent typing
// Not for Firefox because Firefox does not support TextInput event
test('Prevent Input event on TextInput when type to element node', async t => {
    await t
        .typeText(contentEditableWithElementNode, 'Hello')
        .expect(contentEditableWithElementNode.textContent).eql('');
});

// NOTE: Not for IE11 because is's not possible to prevent typing in IE11
// Not for Firefox because Firefox does not support TextInput event
test('Modify text node of ContentEditable div on TextInput event and prevent Input event', async t => {
    await t
        .typeText(contentEditableWithModify, 'Hello')
        .expect(contentEditableWithModify.textContent).eql('AHello');
});

// NOTE: Not for IE11 because this test emulates behavior from https://github.com/DevExpress/testcafe/issues/1956.
// This behavior is different in IE11
// Not for Firefox because Firefox does not support TextInput event
test('Type to ContentEditable div when selected node was replaced on TextInput event', async t => {
    await t
        .typeText(contentEditableWithReplace, 'Hello')
        .expect(contentEditableWithReplace.textContent).eql('HelloX');
});
