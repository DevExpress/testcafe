import { Selector } from 'testcafe';

fixture `Basic authentication - correct credentials`
    .page `http://localhost:3002`
    .httpAuth({ username: 'invalid', password: 'password' });

test.httpAuth({
    username: 'username',
    password: 'password'
})('Authenticate with correct credintials', async t => {
    await t.expect(Selector('#result').innerText).eql('authorized');
});
