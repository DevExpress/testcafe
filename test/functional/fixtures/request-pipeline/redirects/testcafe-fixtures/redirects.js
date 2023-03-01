import { Selector } from 'testcafe';

fixture `Fixture`
    .page('http://localhost:3000/fixtures/request-pipeline/redirects/pages/index.html');

test('test', async t => {
    await t
        .click('#redirect')
        .expect(Selector('h1').textContent).eql('Final page')
        .expect(false).ok();
});
