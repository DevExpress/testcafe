import { Selector } from 'testcafe';

fixture `Open page via proxy`
    .page `http://localhost:3000/fixtures/proxy/pages/index.html`;

test('Should open page via proxy', async t => {
    await t.expect(Selector('#result').innerText).eql('It works !');
});
