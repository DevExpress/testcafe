import { Role, Selector } from 'testcafe';

fixture `Reporter`
    .page `../pages/index.html`;

const simpleRole1 = Role('http://example.com', () => {});

const complexRole = Role('http://localhost:3000/fixtures/reporter/pages/index.html', async t => {
    await t.click('#target');
});

test('Simple test', async t => {
    await t.wait(1);
});

test('Simple command test', async t => {
    await t.click('#target');
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

test('Complex command sequence', async t => {
    await t
        .useRole(Role('http://example.com', () => {}))
        .useRole(Role('http://ya.ru', () => {}));
});

test('Selector', async () => {
    await Selector('#target')();
});

test('Simple assertion', async t => {
    await t.expect(true).eql(true);
});

test('Selector assertion', async t => {
    await t.expect(Selector('#target').innerText).eql('target');
});

test('All actions', async t => {
    await t.click('#target');
    await t.rightClick('#target');
    await t.doubleClick('#target');
    await t.hover('#target');
    await t.drag('#target', 100, 200);
    await t.dragToElement('#target', '#target');
    await t.typeText('#input', 'text');
    await t.selectText('#input', 1, 3);
    await t.selectTextAreaContent('#textarea', 1, 1, 2, 2);
    await t.selectEditableContent('#contenteditable', '#contenteditable');
    await t.pressKey('enter');
    await t.wait(1);
    await t.navigateTo('./index.html');
    await t.setFilesToUpload('#file', '../test.js');
    await t.clearUpload('#file');
    await t.takeScreenshot();
    await t.takeElementScreenshot('#target');
    await t.resizeWindow(200, 200);
    await t.resizeWindowToFitDevice('Sony Xperia Z', { portraitOrientation: true });
    await t.maximizeWindow();
    await t.switchToIframe('#iframe');
    await t.switchToMainWindow();
    await t.eval(() => document.getElementById('#target'));
    await t.setNativeDialogHandler(() => true);
    await t.getNativeDialogHistory();
    await t.getBrowserConsoleMessages();
    await t.expect(true).eql(true);
    await t.setTestSpeed(1);
    await t.setPageLoadTimeout(1);
    await t.useRole(Role.anonymous());
});

