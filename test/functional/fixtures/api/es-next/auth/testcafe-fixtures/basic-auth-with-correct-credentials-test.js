import { Selector } from 'testcafe';

fixture `Basic authentication - correct credentials`
    .httpAuth({ username: 'username', password: 'password' });

test('Authenticate with correct credintials', async t => {
    await t.expect(Selector('#result').innerText).eql('authorized');
}).page `http://localhost:3002`;

test('Authenticate with correct credintials and redirect', async t => {
    await t.expect(Selector('#result').innerText).eql('authorized');
}).page `http://localhost:3002/redirect`;
