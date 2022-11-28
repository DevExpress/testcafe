import { Selector } from 'testcafe';

fixture `Fixture`
    .page `http://localhost:3000/fixtures/request-pipeline/content-security-policy/pages/csp.html`;

test('test', async t => {
    await t.expect(Selector('h2').textContent).eql('script.js is loaded.');
});
