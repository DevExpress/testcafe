import { Selector } from 'testcafe';

fixture `Proxy`
    .page `http://localhost:3000/fixtures/api/es-next/proxy/pages/index.html`;

test('Should open page via proxy', async t => {
    await t.expect(Selector('#result').innerText).eql('It works !');
});

