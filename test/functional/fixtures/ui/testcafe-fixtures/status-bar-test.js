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

test('Recalculate a view size with a status prefix', async t => {
    const statusDiv        = Selector(() => window['%testCafeDriverInstance%'].statusBar.statusDiv);
    const buttons          = Selector(() => window['%testCafeDriverInstance%'].statusBar.buttons);
    const unlockPageArea   = Selector(() => window['%testCafeDriverInstance%'].statusBar.unlockPageArea);
    const fixtureContainer = Selector(() => window['%testCafeDriverInstance%'].statusBar.fixtureContainer);

    await t
        .eval(() => {
            const statusBar = window['%testCafeDriverInstance%'].statusBar;

            statusBar.setStatusPrefix('Status prefix');
            statusBar.showDebuggingStatus();
        });

    await t
        .resizeWindow(1350, 500);

    const getStatusBarItemsVisibility = async () => {
        const fixtureContainerVisible = await fixtureContainer.visible;
        const statusVisible           = await statusDiv.visible;
        const buttonsVisible          = await buttons.visible;
        const unlockPageAreaVisible   = await unlockPageArea.visible;

        return { fixtureContainerVisible, statusVisible, buttonsVisible, unlockPageAreaVisible };
    };

    let itemsVisibility = await getStatusBarItemsVisibility();

    await t
        .expect(itemsVisibility.fixtureContainerVisible).ok()
        .expect(itemsVisibility.statusVisible).ok()
        .expect(itemsVisibility.buttonsVisible).ok()
        .expect(itemsVisibility.unlockPageAreaVisible).ok()
        .resizeWindow(1100, 500)
        .wait(3000);

    itemsVisibility = await getStatusBarItemsVisibility();

    await t
        .expect(itemsVisibility.fixtureContainerVisible).notOk()
        .expect(itemsVisibility.statusVisible).ok()
        .expect(itemsVisibility.buttonsVisible).ok()
        .expect(itemsVisibility.unlockPageAreaVisible).ok()
        .resizeWindow(900, 500);

    itemsVisibility = await getStatusBarItemsVisibility();

    await t
        .expect(itemsVisibility.fixtureContainerVisible).notOk()
        .expect(itemsVisibility.statusVisible).notOk()
        .expect(itemsVisibility.buttonsVisible).ok()
        .expect(itemsVisibility.unlockPageAreaVisible).ok();
});
