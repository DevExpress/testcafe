import { ClientFunction } from 'testcafe';
import { expect } from 'chai';

fixture `Page load`
    .page `http://localhost:3000/fixtures/api/es-next/native-dialogs-handling/pages/page-load.html`;


const getResult = ClientFunction(() => document.getElementById('result').textContent);
const pageUrl   = 'http://localhost:3000/fixtures/api/es-next/native-dialogs-handling/pages/page-load.html';


test('Expected dialogs after page load', async t => {
    await t
        .setNativeDialogHandler((type, text) => {
            if (type === 'confirm' && text === 'Confirm?')
                return true;

            return null;
        });

    expect(await getResult()).equals('true');

    var info = await t.getNativeDialogHistory();

    expect(info).to.deep.equal([
        {
            type: 'confirm',
            text: 'Confirm?',
            url:  pageUrl
        },
        {
            type: 'alert',
            text: 'Alert!',
            url:  pageUrl
        }
    ]);
});

test('Unexpected alert after page load', async t => {
    await t.click('body');
});
