import { Selector } from 'testcafe';

fixture `NTLM authentication`
    .page `http://localhost:3003/`
    .httpAuth({ username: 'username', password: 'password' });

test('Check the authenticated user name', async t => {
    var text        = await Selector('#result').innerText;
    var credentials = JSON.parse(text);

    await t.expect(credentials.UserName).eql('username');
});
