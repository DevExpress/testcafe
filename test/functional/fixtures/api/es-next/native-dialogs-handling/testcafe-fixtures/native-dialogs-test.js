import { ClientFunction, Selector } from 'testcafe';
import { expect } from 'chai';

fixture `Native dialogs`
    .page `http://localhost:3000/fixtures/api/es-next/native-dialogs-handling/pages/index.html`;


const getResult     = ClientFunction(() => document.getElementById('result').textContent);
const pageUrl       = 'http://localhost:3000/fixtures/api/es-next/native-dialogs-handling/pages/index.html';
const promptPageUrl = 'http://localhost:3000/fixtures/api/es-next/native-dialogs-handling/pages/prompt.html';


test('Without handler', async t => {
    var info = await t.getNativeDialogHistory();

    expect(info.length).equals(0);

    await t.click('#buttonConfirm');
});

test('Expected confirm after an action', async t => {
    await t
        .setNativeDialogHandler((type, text) => {
            if (type === 'confirm' && text === 'Confirm?')
                return true;

            return null;
        })
        .click('#buttonConfirm');

    expect(await getResult()).equals('true');
});

test('Expected confirm after an action (with dependencies)', async t => {
    var dialogHandler = ClientFunction((type, text) => {
        if (type === 'confirm' && text === 'Confirm?')
            return true;

        return null;
    });

    await t
        .setNativeDialogHandler((type, text) => dialogHandler(type, text), { dependencies: { dialogHandler } })
        .click('#buttonConfirm');

    expect(await getResult()).equals('true');
});

test('Expected confirm after an action (client function)', async t => {
    var dialogHandler = ClientFunction((type, text) => {
        if (type === 'confirm' && text === 'Confirm?')
            return true;

        return null;
    });

    await t
        .setNativeDialogHandler(dialogHandler)
        .click('#buttonConfirm');

    expect(await getResult()).equals('true');
});

test('Different dialogs after actions', async t => {
    await t
        .setNativeDialogHandler(type => {
            if (type === 'confirm')
                throw new Error('Wrong dialog type');
        })
        .click('#buttonAlert')
        .setNativeDialogHandler(type => {
            if (type === 'alert')
                throw new Error('Wrong dialog type');
        })
        .click('#buttonConfirm');
});

test('Confirm dialog with wrong text', async t => {
    await t
        .setNativeDialogHandler(() => {
            throw new Error('Wrong dialog text');
        })
        .click('#buttonConfirm');

    expect(await getResult()).equals('true');
});

test('No expected confirm after an action', async t => {
    await t
        .click('#withoutDialog')
        .setNativeDialogHandler(() => true);

    var info = await t.getNativeDialogHistory();

    expect(info.length).equals(1);
});

test('Expected beforeUnload after an action', async t => {
    await t
        .setNativeDialogHandler(() => {
        })
        .click('#enableBeforeUnload')
        .click('#linkToThisPage');

    var info = await t.getNativeDialogHistory();

    expect(info).to.deep.equal([{ type: 'beforeunload', text: 'Before unload', url: pageUrl }]);
});

test('Expected alert and prompt after redirect', async t => {
    await t
        .setNativeDialogHandler((type, text, url) => {
            if (type === 'prompt' && text === 'Prompt:' &&
                url === 'http://localhost:3000/fixtures/api/es-next/native-dialogs-handling/pages/prompt.html')
                return 'prompt result';

            return null;
        })
        .click('#buttonRedirectPrompt');

    expect(await getResult()).equals('prompt result');

    var info = await t.getNativeDialogHistory();

    expect(info).to.deep.equal([
        {
            type: 'prompt',
            text: 'Prompt:',
            url:  promptPageUrl
        },
        {
            type: 'alert',
            text: 'Alert!',
            url:  pageUrl
        }
    ]);
});

test('Unexpected prompt after redirect', async t => {
    await t.click('#linkToPromptPage');
});

//Dialogs during wait command execution
test('Expected alert during a wait action', async t => {
    await t
        .setNativeDialogHandler(() => null)
        .click('#buttonDialogAfterTimeout')
        .wait(2000);

    var info = await t.getNativeDialogHistory();

    expect(info).to.deep.equal([{ type: 'alert', text: 'Alert!', url: pageUrl }]);
});

test('No expected alert during a wait action', async t => {
    await t
        .setNativeDialogHandler(() => null)
        .click('#buttonDialogAfterTimeout')
        .wait(10);

    var info = await t.getNativeDialogHistory();

    expect(info.length).equals(1);
});

test('Unexpected alert during a wait action', async t => {
    await t
        .click('#buttonDialogAfterTimeout')
        .wait(2000);
});

//Set dialog handler errors
test('Dialog handler has wrong type', async t => {
    await t.setNativeDialogHandler(42);
});

test('Client function argument wrong type', async t => {
    await t.setNativeDialogHandler(ClientFunction(42));
});

test('Selector as dialogHandler', async t => {
    var dialogHandler = Selector(() => document.body);

    await t.setNativeDialogHandler(dialogHandler);
});


test('Null handler', async t => {
    await t
        .setNativeDialogHandler(() => true)
        .click('#buttonAlert')
        .setNativeDialogHandler(null)
        .click('#buttonAlert');
});
