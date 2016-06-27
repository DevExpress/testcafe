// NOTE: to preserve callsites, add new tests AFTER the existing ones
import { ClientFunction } from 'testcafe';
import { expect } from 'chai';


fixture `Select`
    .page `http://localhost:3000/fixtures/api/es-next/select-text/pages/index.html`;

const getSelectionByElementId = ClientFunction(id => {
    var element = document.getElementById(id);

    return { start: element.selectionStart, end: element.selectionEnd };
});

const checkEditableContentSelection = ClientFunction(() => {
    var selection = window.getSelection();
    var div       = document.getElementById('div');
    var startNode = div.childNodes[1].childNodes[0];
    var endNode   = div.childNodes[3].childNodes[0];

    return selection.anchorNode === startNode && selection.anchorOffset === 0 && selection.focusNode === endNode &&
            selection.focusOffset === endNode.nodeValue.length;
});


test('Select text in input', async t => {
    await t.selectText('#input', 2, 4);

    var selection = await getSelectionByElementId('input');

    expect(selection.start).equals(2);
    expect(selection.end).equals(4);
});

test('Select content in textarea', async t => {
    await t.selectTextAreaContent('#textarea', 0, 2, 1, 3);

    var selection = await getSelectionByElementId('textarea');

    expect(selection.start).equals(2);
    expect(selection.end).equals(7);
});

test('Select editable content', async t => {
    await t.selectEditableContent('#p1', '#p2');

    expect(await checkEditableContentSelection()).to.be.true;
});

test('Incorrect selector in selectText', async t => {
    await t.selectText(null, 2, 4);
});

test('Incorrect startPos in selectText', async t => {
    await t.selectText('#input', -1, 4);
});

test('Incorrect endPos in selectText', async t => {
    await t.selectText('#input', 2, NaN);
});

test('Incorrect selector in selectTextAreaContent', async t => {
    await t.selectTextAreaContent({}, 0, 2, 1, 3);
});

test('Incorrect startLine in selectTextAreaContent', async t => {
    await t.selectTextAreaContent('#textarea', 3.1, 2, 1, 3);
});

test('Incorrect startPos in selectTextAreaContent', async t => {
    await t.selectTextAreaContent('#textarea', 0, '2', 1, 3);
});

test('Incorrect endLine in selectTextAreaContent', async t => {
    await t.selectTextAreaContent('#textarea', 0, 2, -1, 3);
});

test('Incorrect endPos in selectTextAreaContent', async t => {
    await t.selectTextAreaContent('#textarea', 0, 2, 1, false);
});

test('Incorrect startSelector in selectEditableContent', async t => {
    await t.selectEditableContent(false, '#p2');
});

test('Incorrect endSelector in selectEditableContent', async t => {
    await t.selectEditableContent('#p1', 42);
});
