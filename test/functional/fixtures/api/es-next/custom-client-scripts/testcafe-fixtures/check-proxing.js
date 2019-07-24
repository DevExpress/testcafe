import { ClientFunction } from 'testcafe';

const getPageUrl = ClientFunction(() => window.pageUrl);

fixture `Fixture`
    .page('http://localhost:3000/fixtures/api/es-next/custom-client-scripts/pages/index.html');

test('test', async t => {
    await t.expect(getPageUrl()).eql('http://localhost:3000/fixtures/api/es-next/custom-client-scripts/pages/index.html');
});
