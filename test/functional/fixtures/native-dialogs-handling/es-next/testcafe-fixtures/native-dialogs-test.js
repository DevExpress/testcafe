import { ClientFunction, Selector } from 'testcafe';
import { expect } from 'chai';

fixture `Native dialogs`
    .page `http://localhost:3000/fixtures/native-dialogs-handling/es-next/pages/index.html`;

const WAIT_FOR_DIALOG_TIMEOUT = 200;
const getResult               = ClientFunction(() => document.getElementById('result').textContent);

// Alert
test('No expected alert after an action', async t => {
    await t
        .click('#withoutDialog')
        .handleAlertDialog({ timeout: WAIT_FOR_DIALOG_TIMEOUT });
});

test('Unexpected alert after an action', async t => {
    await t
        .click('#buttonAlert');
});

//BeforeUnload
test('No expected beforeUnload after an action', async t => {
    await t
        .click('#linkToThisPage')
        .handleBeforeUnloadDialog({ timeout: WAIT_FOR_DIALOG_TIMEOUT });
});

test('Unexpected beforeUnload after an action', async t => {
    await t
        .click('#enableBeforeUnload')
        .click('#linkToThisPage');
});

test('Unexpected dialog and another execution error', async t => {
    await ClientFunction(() => window.setTimeout(() => {
        /* eslint-disable no-alert*/
        window.alert('Alert!');
        /* eslint-enable no-alert*/
    }, 200))();
    await t.click('#non-existent');
});

//Dialog sequence
test('Dialogs sequence appears after an action', async t => {
    await t
        .click('#enableBeforeUnload')
        .click('#buttonAllDialogsSequence')
        .handleAlertDialog()
        .handleAlertDialog()
        .handleConfirmDialog(true)
        .handleConfirmDialog(false)
        .handlePromptDialog('text')
        .handlePromptDialog(null)
        .handleBeforeUnloadDialog();
});

test('No expected prompt in dialogs sequence after an action', async t => {
    await t
        .click('#buttonAlertConfirm')
        .handleAlertDialog({ timeout: WAIT_FOR_DIALOG_TIMEOUT })
        .handleConfirmDialog(true, { timeout: WAIT_FOR_DIALOG_TIMEOUT })
        .handlePromptDialog(null, { timeout: WAIT_FOR_DIALOG_TIMEOUT });
});

test('Unexpected confirm in dialogs sequence after an action', async t => {
    await t
        .click('#buttonAlertConfirmPrompt')
        .handleAlertDialog()
        .handlePromptDialog();
});

//Timeout after action
test('Dialog alert appears with some timeout after redirect', async t => {
    await t
        .click('#buttonDialogAfterTimeoutWithRedirect')
        .handleAlertDialog({ timeout: 1500 });
});

test('Dialog alert appears with some timeout after an action', async t => {
    await t
        .click('#buttonDialogAfterTimeout')
        .handleAlertDialog({ timeout: WAIT_FOR_DIALOG_TIMEOUT });
});

test('Unexpected dialog appear during waiting for dialog', async t => {
    await t
        .click('#buttonDialogAfterTimeout')
        .handleConfirmDialog(false, { timeout: 1500 });
});

// Dialogs after page redirect
test('Expected alert and confirm after redirect', async t => {
    await t
        .click('#buttonRedirectConfirm')
        .handleAlertDialog()
        .handleConfirmDialog(true);

    expect(await getResult()).equals('true');

    await t.navigateTo('index.html');

    await t.click('#buttonRedirectConfirm')
        .handleAlertDialog()
        .handleConfirmDialog(false);

    expect(await getResult()).equals('false');
});

test('Expected alert and prompt after redirect', async t => {
    await t
        .click('#buttonRedirectPrompt')
        .handleAlertDialog()
        .handlePromptDialog('prompt result');

    expect(await getResult()).equals('prompt result');

    await t.navigateTo('index.html');

    await t.click('#buttonRedirectPrompt')
        .handleAlertDialog()
        .handlePromptDialog(null);

    expect(await getResult()).equals('null');
});

test('No expected confirm after redirect', async t => {
    await t
        .click('#linkToThisPage')
        .handleConfirmDialog(true, { timeout: WAIT_FOR_DIALOG_TIMEOUT });
});

test('Unexpected confirm after redirect', async t => {
    await t.click('#linkToConfirmPage');
});

//Dialog after page load
test('No expected confirm after page load', async t => {
    await t
        .handleConfirmDialog(true, { timeout: WAIT_FOR_DIALOG_TIMEOUT });
});

//NavigateTo
test('Dialog appears during navigateTo action', async t => {
    await t.navigateTo('page-load.html')
        .handleAlertDialog()
        .handleConfirmDialog();
});

test('No expected alert during navigateTo action', async t => {
    await t
        .navigateTo('index.html')
        .handleAlertDialog({ timeout: WAIT_FOR_DIALOG_TIMEOUT })
        .handleConfirmDialog(false, { timeout: WAIT_FOR_DIALOG_TIMEOUT });
});

test('Unexpected confirm during navigateTo action', async t => {
    await t.navigateTo('page-load.html')
        .handleAlertDialog();
});

//Dialogs during wait command execution
test('Expected alert during a wait action', async t => {
    await t
        .click('#buttonDialogAfterTimeout')
        .wait(2000)
        .handleAlertDialog();
});

test('No expected alert during a wait action', async t => {
    await t
        .click('#buttonDialogAfterTimeout')
        .wait(10)
        .handleAlertDialog({ timeout: WAIT_FOR_DIALOG_TIMEOUT });
});

test('Unexpected alert during a wait action', async t => {
    await t
        .click('#buttonDialogAfterTimeout')
        .wait(2000);
});

//Not chained handle command
test('Handle dialog command is not chained to action causing alert', async t => {
    await t.click('#buttonAlert');
    await t.handleAlertDialog();
});

test('Handle dialog command is not chained to action', async t => {
    await t.click('#withoutDialog');
    await t.handleAlertDialog({ timeout: WAIT_FOR_DIALOG_TIMEOUT });
});

//Dialog after a client function
test('Alert during execution of a client function', async t => {
    /* eslint-disable no-alert*/
    await ClientFunction(() => alert('Alert!'))();
    /* eslint-enable no-alert*/
    await t.handleAlertDialog({ timeout: WAIT_FOR_DIALOG_TIMEOUT });
});

test('Alert during execution of a selector', async t => {
    await Selector(() => {
        /* eslint-disable no-alert*/
        alert('Alert!');
        /* eslint-enable no-alert*/
        return document.body;
    })();
    await t.handleAlertDialog({ timeout: WAIT_FOR_DIALOG_TIMEOUT });
});

//Command chaining
test('Execute selector after failed click', async t => {
    var clicks = t
        .click('#withoutDialog')
        .click('#buttonAlert'); //fail

    var selectorResult = t.select(() => {
        throw Error('Selector execution raised an error');
    });

    try {
        await clicks;
    }
    catch (err) {
        await selectorResult; // should be executed
    }
});

test('Execute eval after failed click', async t => {
    var clicks = t
        .click('#withoutDialog')
        .click('#buttonAlert'); //fail

    var evalResult = t.eval(() => {
        throw Error('Eval execution raised an error');
    });

    try {
        await clicks;
    }
    catch (err) {
        await evalResult; // should be executed
    }
});
