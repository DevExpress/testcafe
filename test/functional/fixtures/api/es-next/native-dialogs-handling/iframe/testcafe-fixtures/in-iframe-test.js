import { expect } from 'chai';

fixture `Native dialogs in iframe`
    .page `http://localhost:3000/fixtures/api/es-next/native-dialogs-handling/iframe/pages/page-with-iframe.html`;


const pageUrl        = 'http://localhost:3000/fixtures/api/es-next/native-dialogs-handling/iframe/pages/page-with-iframe.html';
const iframeUrl      = 'http://localhost:3000/fixtures/api/es-next/native-dialogs-handling/iframe/pages/iframe.html';
const childIframeUrl = 'http://localhost:3000/fixtures/api/es-next/native-dialogs-handling/iframe/pages/child-iframe.html';


//Actions in iframe, dialogs in iframe
test('Without handler', async t => {
    var info = await t.getNativeDialogHistory();

    expect(info.length).equals(0);

    await t
        .switchToIframe('#iframe')
        .click('#buttonAlert');
});

test('Expected alert in iframe after an action in iframe', async t => {
    await t
        .switchToIframe('#iframe')
        .setNativeDialogHandler(() => null)
        .click('#buttonAlert');

    var info = await t.getNativeDialogHistory();

    expect(info).to.deep.equal([{ type: 'alert', text: 'Alert!', url: iframeUrl }]);
});

test('Alert dialog with wrong text', async t => {
    await t
        .switchToIframe('#iframe')
        .setNativeDialogHandler(() => {
            throw new Error('Wrong dialog text');
        })
        .click('#buttonAlert');
});

test('No expected alert after an action in iframe', async t => {
    await t
        .switchToIframe('#iframe')
        .setNativeDialogHandler(() => null)
        .click('#withoutDialog');

    var info = await t.getNativeDialogHistory();

    expect(info.length).equals(1);
});

test('Unexpected alert in iframe after an action in iframe', async t => {
    await t
        .switchToIframe('#iframe')
        .click('#buttonAlert');
});

//Actions in top window, dialogs in iframe
test('Expected alert in iframe after an action in top window', async t => {
    await t
        .switchToIframe('#iframe')
        .switchToMainWindow()
        .setNativeDialogHandler(() => null)
        .click('#buttonIframeAlert');

    var info = await t.getNativeDialogHistory();

    expect(info).to.deep.equal([{ type: 'alert', text: 'Alert!', url: iframeUrl }]);
});

test('Unexpected alert in iframe after an action in top window', async t => {
    await t
        .switchToIframe('#iframe')
        .switchToMainWindow()
        .click('#buttonIframeAlert');
});

//Actions in iframe, dialogs in top window
test('Expected alert in top window after an action in iframe', async t => {
    await t
        .switchToIframe('#iframe')
        .setNativeDialogHandler(() => null)
        .click('#buttonTopWindowAlert');

    var info = await t.getNativeDialogHistory();

    expect(info).to.deep.equal([{ type: 'alert', text: 'Alert!', url: pageUrl }]);
});

test('Unexpected alert in top window after an action in iframe', async t => {
    await t
        .switchToIframe('#iframe')
        .click('#buttonTopWindowAlert');
});

//Nested iframes
test('Expected alert in parent iframe after an action in child iframe', async t => {
    await t
        .switchToIframe('#iframe')
        .switchToIframe('#childIframe')
        .setNativeDialogHandler(() => function (type, text, url) {
            if (url !== 'http://localhost:3000/fixtures/api/es-next/native-dialogs-handling/iframe/pages/iframe.html')
                throw new Error('Wrong dialog url');
        })
        .click('#buttonParentIframeAlert');

    var info = await t.getNativeDialogHistory();

    expect(info).to.deep.equal([{ type: 'alert', text: 'Alert!', url: iframeUrl }]);
});

test('Expected alert in child iframe after an action in parent iframe', async t => {
    await t
        .switchToIframe('#iframe')
        .switchToIframe('#childIframe')
        .switchToMainWindow() // NOTE: waiting for all iframes loading
        .switchToIframe('#iframe')
        .setNativeDialogHandler(() => () => function (type, text, url) {
            if (url !== 'http://localhost:3000/fixtures/api/es-next/native-dialogs-handling/iframe/pages/child-iframe.html')
                throw new Error('Wrong dialog url');
        })
        .click('#buttonChildIframeAlert');

    var info = await t.getNativeDialogHistory();

    expect(info).to.deep.equal([{ type: 'alert', text: 'Alert!', url: childIframeUrl }]);
});
