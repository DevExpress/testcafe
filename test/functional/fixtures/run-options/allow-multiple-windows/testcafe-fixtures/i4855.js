import { Selector } from 'testcafe';

fixture `Should not finalize the 'ExecuteSelectorCommand' command on driver starting (GH-4855)`
    .page('http://localhost:3000/fixtures/run-options/allow-multiple-windows/pages/i4855/index.html');

test('test', async t => {
    await t
        .click('a')
        .click('a')
        .expect(Selector('span').textContent).eql('Checked text');
});
