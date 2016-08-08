import { expect } from 'chai';

fixture `Page load`
    .page `http://localhost:3000/fixtures/native-dialogs-handling/iframe/pages/page-load.html`;

test('Expected dialogs after page load', async t => {
    await t
        .setNativeDialogHandler(() => null);

    // NOTE: waiting for iframe loading
    await t.switchToIframe('#iframe');

    var info = await t.getNativeDialogHistory();

    expect(info).to.deep.equal([
        { type: 'confirm', text: 'Confirm?' },
        { type: 'alert', text: 'Alert!' },
        { type: 'alert', text: 'Alert!' }
    ]);
});

test('Unexpected alert after page load', async t => {
    await t.click('body');
});
