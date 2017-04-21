import { Selector } from 'testcafe';

fixture `Open restricted page via proxy`
    .page `http://localhost:3002`;

test('Authenticate via proxy server', async t => {
    await t.expect(Selector('#result').innerText).eql('authorized');
});
