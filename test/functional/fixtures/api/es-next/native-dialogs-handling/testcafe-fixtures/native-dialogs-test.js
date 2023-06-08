import { ClientFunction, Selector } from 'testcafe';

fixture `Native dialogs`
    .page `http://localhost:3000/fixtures/api/es-next/native-dialogs-handling/pages/index.html`;


const getResult     = ClientFunction(() => document.getElementById('result').textContent);
const pageUrl       = 'http://localhost:3000/fixtures/api/es-next/native-dialogs-handling/pages/index.html';
const promptPageUrl = 'http://localhost:3000/fixtures/api/es-next/native-dialogs-handling/pages/prompt.html';


test('Without handler', async t => {
    const info = await t.getNativeDialogHistory();

    await t.expect(info.length).eql(0);

    await t.click('#buttonConfirm');
});


test('Print without handler', async t => {
    const info = await t.getNativeDialogHistory();

    await t.expect(info.length).eql(0);

    await t.click('#buttonPrint');
});

test('Expected print after an action', async t => {
    await t
        .setNativeDialogHandler(() => null)
        .click('#buttonPrint');

    const dialogs = await t.getNativeDialogHistory();

    await t.expect(dialogs).eql([{ type: 'print', url: pageUrl }]);
});


test('Expected geolocation object and geolocation error returned after an action', async t => {
    await t
        .setNativeDialogHandler((type) => {
            if (type === 'geolocation')
                return { timestamp: 12356, coords: {} };

            return null;
        })
        .click('#buttonGeo')
        .expect(getResult()).eql('{"timestamp":12356,"coords":{}}')
        .setNativeDialogHandler((type) => {
            if (type !== 'geolocation')
                return null;

            const err = new Error('Some error');

            err.code = 1;

            return err;
        })
        .click('#buttonGeo')
        .expect(getResult()).eql('Some error');
});

test('Expected confirm after an action', async t => {
    await t
        .setNativeDialogHandler((type, text) => {
            if (type === 'confirm' && text === 'Confirm?')
                return true;

            return null;
        })
        .click('#buttonConfirm');

    await t.expect(await getResult()).eql('true');
});

test('Expected confirm after an action (with dependencies)', async t => {
    const dialogHandler = ClientFunction((type, text) => {
        if (type === 'confirm' && text === 'Confirm?')
            return true;

        return null;
    });

    await t
        .setNativeDialogHandler((type, text) => dialogHandler(type, text), { dependencies: { dialogHandler } })
        .click('#buttonConfirm');

    await t.expect(await getResult()).eql('true');
});

test('Expected confirm after an action (client function)', async t => {
    const dialogHandler = ClientFunction((type, text) => {
        if (type === 'confirm' && text === 'Confirm?')
            return true;

        return null;
    });

    await t
        .setNativeDialogHandler(dialogHandler)
        .click('#buttonConfirm');

    await t.expect(await getResult()).eql('true');
});

test('Different dialogs after actions', async t => {
    await t
        .setNativeDialogHandler(type => {
            if (type !== 'alert')
                throw new Error('Wrong dialog type');
        })
        .click('#buttonAlert')
        .setNativeDialogHandler(type => {
            if (type !== 'confirm')
                throw new Error('Wrong dialog type');
        })
        .click('#buttonConfirm')
        .setNativeDialogHandler(type => {
            if (type !== 'print')
                throw new Error('Wrong dialog type');
        })
        .click('#buttonPrint');
});

test('Confirm dialog with wrong text', async t => {
    await t
        .setNativeDialogHandler(() => {
            throw new Error('Wrong dialog text');
        })
        .click('#buttonConfirm');

    await t.expect(await getResult()).eql('true');
});

test('No expected confirm after an action', async t => {
    await t
        .click('#withoutDialog')
        .setNativeDialogHandler(() => true);

    const info = await t.getNativeDialogHistory();

    await t.expect(info.length).eql(1);
});

test('Expected beforeUnload after an action', async t => {
    await t
        .setNativeDialogHandler(() => {
        })
        .click('#enableBeforeUnload')
        .click('#linkToThisPage');

    const info = await t.getNativeDialogHistory();

    await t.expect(info).eql([{ type: 'beforeunload', text: 'Before unload', url: pageUrl }]);
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

    await t.expect(await getResult()).eql('prompt result');

    const info = await t.getNativeDialogHistory();

    await t.expect(info).eql([
        {
            type: 'prompt',
            text: 'Prompt:',
            url:  promptPageUrl,
        },
        {
            type: 'alert',
            text: 'Alert!',
            url:  pageUrl,
        },
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

    const info = await t.getNativeDialogHistory();

    await t.expect(info).eql([{ type: 'alert', text: 'Alert!', url: pageUrl }]);
});

test('No expected alert during a wait action', async t => {
    await t
        .setNativeDialogHandler(() => null)
        .click('#buttonDialogAfterTimeout')
        .wait(10);

    const info = await t.getNativeDialogHistory();

    await t.expect(info.length).eql(1);
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
    const dialogHandler = Selector(() => document.body);

    await t.setNativeDialogHandler(dialogHandler);
});


test('Null handler', async t => {
    await t
        .setNativeDialogHandler(() => true)
        .click('#buttonAlert')
        .setNativeDialogHandler(null)
        .click('#buttonAlert');
});
