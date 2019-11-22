import { Selector, Role, RequestLogger, ClientFunction } from 'testcafe';

fixture `test`
    .page`../pages/full-actions.html`;

const role         = Role('http://example.com', () => {});
const simpleLogger = RequestLogger(/.*/);
const foo          = ClientFunction(() => {});

const h1              = Selector('h1');
const input           = Selector('#input');
const textarea        = Selector('#textarea');
const contenteditable = Selector('#contenteditable');

test(`test log`, async t => {
    await t.useRole(role);
    await t.addRequestHooks(simpleLogger);
    await t.removeRequestHooks(simpleLogger);
    await t.navigateTo('../pages/index.html');
    await foo();
    await t.setTestSpeed(1);
    await h1();
    await input.value;
    await t.click(h1);
    await t.rightClick('h1');
    await t.doubleClick('h1');
    await t.dragToElement('#drag', '#dragTarget');
    await t.drag('#drag', 100, 200);
    await t.typeText(input, 'hello world');
    await t.expect(input.value).eql('hello world');
    await t.hover(h1);
    await t.takeScreenshot();
    await t.takeElementScreenshot(h1);
    await t.pressKey('enter');
    await t.selectText(input, 1, 3);
    await t.selectTextAreaContent(textarea, 1, 1, 2, 2);
    await t.selectEditableContent(contenteditable, contenteditable);
    await t.setNativeDialogHandler(() => true);
    // eslint-disable-next-line no-alert
    await t.eval(() => alert('test'));
    await t.getBrowserConsoleMessages();
    await t.getNativeDialogHistory();
    await t.switchToIframe('iframe');
    await t.switchToMainWindow();
    await t.setFilesToUpload('#file', './index.js');
    await t.clearUpload('#file');
    await t.resizeWindow(200, 200);
    await t.resizeWindowToFitDevice('Sony Xperia Z', { portraitOrientation: true });
    await t.maximizeWindow();
    await t.setPageLoadTimeout(10000);
    await t.wait(1);
});
