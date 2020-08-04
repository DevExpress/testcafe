import { Selector, ClientFunction } from 'testcafe';

const page = 'http://localhost:3000/fixtures/multiple-windows/pages/i4855/index.html';

const getLocation = ClientFunction(() => window.location.href);

fixture `Should not finalize some commands on driver starting (GH-4855)`
    .page(page);

test('ExecuteSelectorCommand', async t => {
    await t
        .click('a')
        .click('a')
        .expect(Selector('span').textContent).eql('Checked text');
});

test('ExecuteClientFunctionCommand', async t => {
    await t
        .click('a')
        .click('a')
        .expect(getLocation()).eql(page);
});
