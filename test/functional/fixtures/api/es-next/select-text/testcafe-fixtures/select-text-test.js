// NOTE: to preserve callsites, add new tests AFTER the existing ones
import { Selector, ClientFunction } from 'testcafe';
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

test('Start element selector returns text node', async t => {
    const getNode = Selector(() => document.getElementById('p2').childNodes[0]);

    await t.selectEditableContent(getNode, '#p1');
});

test('End element selector returns text node', async t => {
    const getNode = Selector(() => document.getElementById('p2').childNodes[0]);

    await t.selectEditableContent('#p1', getNode);
});

const isIEFunction = ClientFunction(() => {
    var userAgent = window.navigator.userAgent;
    var appName   = window.navigator.appName;
    var isIE11Re  = new RegExp('Trident/.*rv:([0-9]{1,}[.0-9]{0,})');
    var isMSEdge  = /Edge/.test(navigator.userAgent);

    return appName === 'Microsoft Internet Explorer' ||
           appName === 'Netscape' && isIE11Re.exec(userAgent) !== null ||
           isMSEdge;
});

test('simple inverse selection in contenteditable', async t => {
    await t.selectText(Selector('#div'), 28, 2);

    const checkEditableContentInverseSelection = ClientFunction(() => {
        const selection   = window.getSelection();
        const div         = document.getElementById('div');
        const isIE        = isIEFunction();
        const startNode   = isIE ? div.childNodes[0] : div.childNodes[3].childNodes[0];
        const startOffset = isIE ? 2 : 3;
        const endNode     = isIE ? div.childNodes[3].childNodes[0] : div.childNodes[0];
        const endOffset   = isIE ? 3 : 2;

        return selection.anchorNode === startNode &&
               selection.anchorOffset === startOffset &&
               selection.focusNode === endNode &&
               selection.focusOffset === endOffset;
    }, { dependencies: { isIEFunction: isIEFunction } });

    await t.expect(checkEditableContentInverseSelection()).ok();
});

test('difficult inverse selection in contenteditable', async t => {
    await t.selectText(Selector('#bigDiv'), 141, 4);

    const checkEditableContentInverseSelection = ClientFunction(() => {
        const selection   = window.getSelection();
        const div         = document.getElementById('bigDiv');
        const isIE        = isIEFunction();
        const startNode   = isIE ? div.childNodes[0] : div.childNodes[10];
        const startOffset = isIE ? 4 : 1;
        const endNode     = isIE ? div.childNodes[10] : div.childNodes[0];
        const endOffset   = isIE ? 1 : 4;

        return selection.anchorNode === startNode &&
               selection.anchorOffset === startOffset &&
               selection.focusNode === endNode &&
               selection.focusOffset === endOffset;
    }, { dependencies: { isIEFunction: isIEFunction } });

    await t.expect(checkEditableContentInverseSelection()).ok();
});
