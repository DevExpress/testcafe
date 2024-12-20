import { Selector } from 'testcafe';

fixture('GH-8321 - Callsite Issue')
    .page`http://localhost:3000/fixtures/regression/gh-8321/pages/index.html`;

test('Callsite Issue', async t => {
    const editor = Selector('[contenteditable=true]');

    await t.click(editor);
    await t.typeText(editor, 'text1');
});
