import { Selector } from 'testcafe';

fixture `NTLM authentication`
    .page `http://localhost:3003/`
    .httpAuth({ username: 'username', password: 'password' });

test('Check the authenticated user name', async t => {
    const text        = await Selector('#result').innerText;
    const credentials = JSON.parse(text);

    await t.expect(credentials.UserName).eql('username');
});
