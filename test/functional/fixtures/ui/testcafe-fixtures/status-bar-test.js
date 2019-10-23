import { Selector } from 'testcafe';

fixture `Status Bar`
    .page `http://localhost:3000/fixtures/ui/pages/empty-page.html`;

test('Show status prefix', async t => {
    const statusDiv = Selector(() => window['%testCafeDriverInstance%'].statusBar.statusDiv);

    let statusText = await statusDiv.innerText;

    await t
        .expect(statusText).notOk()
        .expect(statusDiv.innerText).eql('Waiting for assertion execution...');

    await t
        .eval(() => window['%testCafeDriverInstance%'].statusBar.setStatusPrefix('Status prefix'));

    statusText = await statusDiv.innerText;

    await t
        .expect(statusText.trim()).eql('Status prefix.')
        .expect(statusDiv.innerText).eql('Status prefix. Waiting for assertion execution...');
});
