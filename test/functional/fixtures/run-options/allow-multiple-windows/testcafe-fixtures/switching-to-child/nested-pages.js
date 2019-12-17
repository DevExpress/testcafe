import { ClientFunction } from 'testcafe';

const getPageTitle = ClientFunction(() => document.title);

fixture `Fixture`
    .page('http://localhost:3000/fixtures/run-options/allow-multiple-windows/pages/switching-to-child/nested-pages/first.html');

test('test', async t => {
    await t
        .click('a')
        .click('a')
        .expect(getPageTitle()).eql('Third page');
});
