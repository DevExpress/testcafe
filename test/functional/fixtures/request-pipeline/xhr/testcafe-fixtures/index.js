import { Selector } from 'testcafe';

fixture('My fixture')
    .page('http://localhost:3000/fixtures/request-pipeline/xhr/pages/index.html');
test('Click test header button', async t => {
    await t.click('#test-header');
    await t.expect(Selector('#xhr-result').textContent).eql('test-string');
});
test('Click auth header button', async t => {
    await t.click('#auth-header');
    await t.expect(Selector('#xhr-result').textContent).eql('authorization-string');
});
test('Click delay button', async t => {
    await t.click('#delay');
    await t.click('#xhr-result');
});
