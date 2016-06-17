import { ClientFunction } from 'testcafe';
import { expect } from 'chai';

fixture `Page load`
    .page `http://localhost:3000/fixtures/native-dialogs-handling/es-next/pages/page-load.html`;


const getResult = ClientFunction(() => document.getElementById('result').textContent);


test('Expected dialogs after page load', async t => {
    await t
        .handleAlertDialog()
        .handleConfirmDialog(true);

    expect(await getResult()).equals('true');

    await t
        .click('#linkToConfirmPage')
        .handleConfirmDialog(false);

    expect(await getResult()).equals('false');
});

test('Unexpected alert after page load', async t => {
    await t.click('body');
});
