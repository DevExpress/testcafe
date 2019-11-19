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

test('Hide elements when resizing the window', async t => {
    const statusBarDiv = Selector(() => window['%testCafeDriverInstance%'].statusBar.statusBar);
    const statusDiv    = Selector(() => window['%testCafeDriverInstance%'].statusBar.statusDiv);
    const icon         = Selector(() => window['%testCafeDriverInstance%'].statusBar.icon);
    const buttons      = Selector(() => window['%testCafeDriverInstance%'].statusBar.buttons);
    const userAgent    = statusBarDiv.find('.user-agent-hammerhead-shadow-ui');

    await t
        .eval(() => {
            const statusBar = window['%testCafeDriverInstance%'].statusBar;

            statusBar.setStatusPrefix('Status prefix');
            statusBar.showDebuggingStatus();
        });

    await t
        .resizeWindow(1000, 400);

    //If we await these properties during the assertion execution, the status will be changed to "Waiting for..."
    const getStatusBarItemsVisibility = async () => {
        const userAgentVisible      = await userAgent.visible;
        const statusVisible         = await statusDiv.visible;
        const buttonCaptionsVisible = await buttons.find('span').filterVisible().count === 3;
        const iconVisible           = await icon.visible;

        return { userAgentVisible, statusVisible, buttonCaptionsVisible, iconVisible };
    };

    let itemsVisibility = await getStatusBarItemsVisibility();

    await t
        .expect(itemsVisibility.userAgentVisible).ok()
        .expect(itemsVisibility.statusVisible).ok()
        .expect(itemsVisibility.buttonCaptionsVisible).ok()
        .expect(itemsVisibility.iconVisible).ok()
        .resizeWindow(800, 400);

    itemsVisibility = await getStatusBarItemsVisibility();

    await t
        .expect(itemsVisibility.userAgentVisible).notOk()
        .expect(itemsVisibility.statusVisible).ok()
        .expect(itemsVisibility.buttonCaptionsVisible).ok()
        .expect(itemsVisibility.iconVisible).ok()
        .resizeWindow(600, 400);

    itemsVisibility = await getStatusBarItemsVisibility();

    await t
        .expect(itemsVisibility.userAgentVisible).notOk()
        .expect(itemsVisibility.statusVisible).ok()
        .expect(itemsVisibility.buttonCaptionsVisible).notOk()
        .expect(itemsVisibility.iconVisible).notOk()
        .resizeWindow(520, 400);

    itemsVisibility = await getStatusBarItemsVisibility();

    await t
        .expect(itemsVisibility.userAgentVisible).notOk()
        .expect(itemsVisibility.statusVisible).ok()
        .expect(itemsVisibility.buttonCaptionsVisible).notOk()
        .expect(itemsVisibility.iconVisible).notOk()
        .expect(statusBarDiv.clientHeight).eql(82);
});
