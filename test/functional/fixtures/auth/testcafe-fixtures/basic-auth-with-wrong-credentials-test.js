import { Selector } from 'testcafe';

fixture `Basic authentication - wrong credentials`
    .page `http://localhost:3002`
    .httpAuth('invalid', 'invalid');

test('Authenticate with wrong credentials', async t => {
    await t.expect(Selector('#result').innerText).eql('not authorized');
});
