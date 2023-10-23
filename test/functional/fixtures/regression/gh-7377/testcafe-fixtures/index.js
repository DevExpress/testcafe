import { Selector } from 'testcafe';

fixture `fixture`
    .page `http://localhost:3000/fixtures/regression/gh-7377/pages/index.html`;

const input = Selector('#input').find('input');


test('test', async (t) => {
    await t.typeText(input, 'test');
    await t.expect(input.value).eql('test');
});
