import { expect } from 'chai';

fixture `Page load`
    .page `http://localhost:3000/fixtures/api/es-next/native-dialogs-handling/iframe/pages/page-load.html`;


const pageUrl   = 'http://localhost:3000/fixtures/api/es-next/native-dialogs-handling/iframe/pages/page-load.html';
const iframeUrl = 'http://localhost:3000/fixtures/api/es-next/native-dialogs-handling/iframe/pages/iframe-load.html';


test('Expected dialogs after page load', async t => {
    await t
        .setNativeDialogHandler(() => null);

    // NOTE: waiting for iframe loading
    await t.switchToIframe('#iframe');

    var info = await t.getNativeDialogHistory();

    expect(info).to.deep.equal([
        { type: 'confirm', text: 'Confirm?', url: iframeUrl },
        { type: 'alert', text: 'Alert!', url: iframeUrl },
        { type: 'alert', text: 'Alert!', url: pageUrl }
    ]);
});

test('Unexpected alert after page load', async t => {
    await t.click('body');
});
