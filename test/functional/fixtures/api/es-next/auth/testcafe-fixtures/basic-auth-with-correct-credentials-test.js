import { Selector } from 'testcafe';

fixture `Basic authentication - correct credentials`
    .page `http://localhost:3002`
    .httpAuth({ username: 'username', password: 'password' });

test('Authenticate with correct credintials', async t => {
    await t.expect(Selector('#result').innerText).eql('authorized');
});
