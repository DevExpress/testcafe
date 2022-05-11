import { Selector, ClientFunction } from 'testcafe';

fixture(`RG-4558 - Invisible iframe`)
    .page(`http://localhost:3000/fixtures/regression/gh-4558/pages/index.html`);

async function expectResultText (t, text = 'OK') {
    await t.expect(Selector('#result').innerText).eql(text);
}

async function setNativeDialogHandler (t) {
    await t
        .setNativeDialogHandler((type, text) => {
            switch (type) {
                case 'confirm':
                    return text === 'confirm';
                case 'prompt':
                    return 'PROMPT';
                default:
                    return true;
            }
        });
}

const iframeSelector          = Selector('#invisibleIframe');

const focusDocument = ClientFunction(() => {
    document.getElementById('focusInput').focus();
});

test('Button click', async t => {
    await t.switchToIframe(iframeSelector);
    await t.click(Selector('#button', { timeout: 200 }));

    throw new Error('Test rejection expected');
});

test('Press key', async t => {
    await t.switchToIframe(iframeSelector);
    await focusDocument();
    await t.pressKey('a');
    await expectResultText(t);
});

test('Set files to upload and clear upload', async t => {
    await t.switchToIframe(iframeSelector);
    await t.setFilesToUpload('#upload', '../test-data/data.js');
    await expectResultText(t, 'ADD');
    await t.clearUpload('#upload');
    await expectResultText(t, 'CLEAR');
});


test('Dispatch a Click event', async t => {
    await t.switchToIframe(iframeSelector);

    const eventArgs = {
        cancelable: false,
        bubbles:    false,
    };

    const options = Object.assign(
        { eventConstructor: 'MouseEvent' },
        eventArgs,
    );

    await t
        .dispatchEvent('#button', 'click', options);

    await expectResultText(t);
});

test('Eval', async t => {
    await t.switchToIframe(iframeSelector);
    await t.eval(() => window.setSpanText());
    await expectResultText(t);
});

test('Set native dialog handler and get common dialog history', async t => {
    await t.switchToIframe(iframeSelector);
    await setNativeDialogHandler(t);
    await t.eval(() => window.showDialog('confirm'));
    await expectResultText(t, 'CONFIRM');
    await t.eval(() => window.showDialog('prompt'));
    await expectResultText(t, 'PROMPT');
    await t.switchToMainWindow();
    await t.eval(() => window.showNativeDialog('alert'));

    const history = await t.getNativeDialogHistory();

    await t.expect(history[0].url).contains('index.html');
    await t.expect(history[1].url).contains('iframePage.html');
    await t.expect(history[2].url).contains('iframePage.html');
});

test('Get browser console messages', async t => {
    await t.switchToIframe(iframeSelector);
    await t.eval(() => window.logToConsole('console-test'));
    const browserConsoleMessages = await t.getBrowserConsoleMessages();

    await t.expect(browserConsoleMessages.log).contains('console-test');
});

test('Switch to inner iframe', async t => {
    await t.switchToIframe(iframeSelector);
    await t.switchToIframe(Selector('#iframe2'));
    await expectResultText(t);
});


test('Hidden by visibility style', async t => {
    await t.switchToIframe('#hiddenIframe');

    throw new Error('Test rejection expected');
});

