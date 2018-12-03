import { Selector } from 'testcafe';

fixture `GH-3021 - Should not wait for selector timeout`
    .page `http://localhost:3000/fixtures/regression/gh-3021/pages/index.html`;

test('Execute `selectText` command', async t => {
    const input = Selector('#input');

    await t.selectText(input);
});
