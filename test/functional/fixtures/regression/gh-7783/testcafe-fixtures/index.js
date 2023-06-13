import { Selector } from 'testcafe';

fixture `Trim BOM symbol in Native Automation`
    .page `http://localhost:3000/trim-bom`;

test('Trim BOM symbol in Native Automation', async t => {
    await t.expect(Selector(() => document.body.children[0]).tagName).eql('button');
});
