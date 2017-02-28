import { Selector } from 'testcafe';

fixture `gh-1275`
    .page `http://localhost:3000/fixtures/regression/gh-1275/pages/index.html`;

test('Hide input on blur', async t => {
    await t
        .click('#input1')
        .pressKey('tab')
        .pressKey('a b c')
        .expect(Selector('#input2').value).eql('abc');
});
