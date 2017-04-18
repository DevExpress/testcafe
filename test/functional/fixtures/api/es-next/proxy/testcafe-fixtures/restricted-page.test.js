import { Selector } from 'testcafe';

fixture `gh-1206`
    .page `http://localhost:3002`;

test('Authenticate via proxy server', async t => {
    await t.expect(Selector('#result').innerText).eql('authorized');
});
