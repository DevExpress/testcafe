import { Role, Selector, ClientFunction } from 'testcafe';

const page = 'http://localhost:3000/fixtures/reporter/pages/index.html';

fixture`Reporter`
    .page`../pages/index.html`;

const simpleRole1 = Role(page, () => {
}, { preserveUrl: true });

const complexRole = Role(page, async t => {
    await t.click('#target');
});

const errorRole = Role(page, async t => {
    await t.click(Selector('#non-existing-element'), { timeout: 100 });
});

const foo = ClientFunction(bool => () => bool);

test('Simple test', async t => {
    await t.wait(1);
});

test('Simple command test', async t => {
    await t.click(Selector('#target'));
});

test('Simple command err test', async t => {
    await t.click('#non-existing-target');
});

test('Complex command test', async t => {
    await t.useRole(simpleRole1);
});

test('Complex nested command test', async t => {
    await t.useRole(complexRole);
});

test('Complex nested command error', async t => {
    await t.useRole(errorRole);
});

test('Simple assertion', async t => {
    await t.expect(true).eql(true, 'assertion message', { timeout: 100 });
});

test('Selector assertion', async t => {
    await t.expect(Selector('#target').innerText).eql('target');
});

test('Snapshot', async () => {
    await Selector('#target')();

    await Selector('body').find('#target').innerText;
});

test('Client Function', async () => {
    await foo(1, true);
});

test('Eval', async t => {
    await t.eval(() => document.getElementById('#target'));
});

test('All actions', async t => {
    const options = {
        caretPos:  1,
        modifiers: {
            alt:   true,
            ctrl:  true,
            meta:  true,
            shift: true
        },
        offsetX:            1,
        offsetY:            2,
        destinationOffsetX: 3,
        destinationOffsetY: 4,
        speed:              1,
        replace:            true,
        paste:              true,
    };

    await t.rightClick('#target', options)
        .doubleClick('#target', options)
        .hover('#target', options)
        .drag('#target', 100, 200, options)
        .dragToElement('#target', '#target', options)
        .typeText('#input', 'test', options)
        .selectText('#input', 1, 3, options)
        .selectTextAreaContent('#textarea', 1, 2, 3, 4, options)
        .selectEditableContent('#contenteditable', '#contenteditable', options)
        .pressKey('enter', options)
        .wait(1)
        .navigateTo('./index.html')
        .setFilesToUpload('#file', '../test.js')
        .clearUpload('#file')
        .takeScreenshot({ path: 'screenshotPath', fullPage: true })
        .takeElementScreenshot('#target', 'screenshotPath')
        .resizeWindow(200, 200)
        .resizeWindowToFitDevice('Sony Xperia Z', { portraitOrientation: true })
        .maximizeWindow()
        .switchToIframe('#iframe')
        .switchToMainWindow()
        .setNativeDialogHandler(() => true)
        .setTestSpeed(1)
        .setPageLoadTimeout(1);

    await t.getNativeDialogHistory();
    await t.getBrowserConsoleMessages();
});

