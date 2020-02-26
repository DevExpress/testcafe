import { Selector, ClientFunction } from 'testcafe';
import OS from 'os-family';
import { saveWindowState, restoreWindowState } from '../../../window-helpers';

fixture `Status Bar`
    .page `http://localhost:3000/fixtures/ui/pages/empty-page.html`
    .beforeEach(async t => {
        await saveWindowState(t);
    })
    .afterEach(async t => {
        await restoreWindowState(t);
    });

test('Show status prefix', async t => {
    const statusDiv   = Selector(() => window['%testCafeDriverInstance%'].statusBar.statusDiv);
    const progressBar = Selector(() => window['%testCafeDriverInstance%'].statusBar.progressBar.progressBar);
    const setStatusPrefix = ClientFunction(statusPrefix => {
        const statusBar = window['%testCafeDriverInstance%'].statusBar;

        statusBar.progressBar.show();
        statusBar.setStatusPrefix(statusPrefix);
    });

    let statusText = await statusDiv.innerText;

    await t
        .expect(statusText).notOk()
        .expect(statusDiv.innerText).eql('Waiting for assertion execution...');

    await setStatusPrefix('Status prefix');

    const progressBarVisible = await progressBar.visible;

    statusText = await statusDiv.innerText;

    await t
        .expect(statusText.trim()).eql('Status prefix')
        .expect(progressBarVisible).ok()
        .expect(statusDiv.innerText).eql('Status prefix. Waiting for assertion execution...')
        .navigateTo('about:blank')
        .expect(statusDiv.innerText).eql('Status prefix. Waiting for assertion execution...');

    await setStatusPrefix('Modified status prefix');

    statusText = await statusDiv.innerText;

    await t
        .expect(statusText.trim()).eql('Modified status prefix');
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

    if (!OS.mac) {
        await t
            .expect(itemsVisibility.userAgentVisible).ok()
            .expect(itemsVisibility.statusVisible).ok()
            .expect(itemsVisibility.buttonCaptionsVisible).ok()
            .expect(itemsVisibility.iconVisible).ok();
    }

    await t.resizeWindow(800, 400);

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
