import { Selector } from 'testcafe';

fixture `GH-2205 - Should type in div if it has an invisible child with contententeditable=false`
    .page `http://localhost:3000/fixtures/regression/gh-2205/pages/index.html`;

async function typeAndCheck (t, editorId) {
    const editor = Selector(editorId);

    await t
        .click(editor)
        .typeText(editor, 'Hello')
        .expect(editor.innerText).contains('Hello');
}

test(`Click on div with display:none placeholder`, async t => {
    await typeAndCheck(t, '#editor1');
});

test(`Click on div with visibility:hidden placeholder`, async t => {
    await typeAndCheck(t, '#editor2');
});

test(`Click on div with two invisible placeholders`, async t => {
    await typeAndCheck(t, '#editor3');
});

