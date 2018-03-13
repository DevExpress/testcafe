import { Selector } from 'testcafe';

fixture `Open page without proxy but get resource with proxy`
    .page `http://localhost:3000/fixtures/proxy/pages/bypass-page-proxy-request.html`;

test('Should open page without proxy but get resource with proxy', async t => {
    await t.expect(Selector('#result').innerText).eql('proxy');
});
