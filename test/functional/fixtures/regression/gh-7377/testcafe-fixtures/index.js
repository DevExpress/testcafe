import { Selector } from 'testcafe';

fixture `fixture`
    .page `http://localhost:3000/fixtures/regression/gh-7377/pages/index.html`;

const input8 = Selector('#input8').find('input');


test('test', async (t) => {
    await t.resizeWindow(500, 270);
    await t.typeText(input8, 'test');
    await t.expect(input8.value).eql('test');
});
