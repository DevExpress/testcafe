/// <reference path="../../../../../ts-defs/index.d.ts" />
import { Selector, ClientFunction } from 'testcafe';
import { expect } from 'chai';

fixture(`TestController`)
    .page(`http://localhost:3000/fixtures/api/es-next/assertions/pages/index.html`);

test('.eql() assertion', async t => {
    await t
        .expect({a: 2}).eql({a: 2})
        .expect('hey').eql('yo', 'testMessage');
});

test('.notEql() assertion', async t => {
    await t
        .expect({b: 3}).notEql({a: 2})
        .expect(2).notEql(2);
});

test('.ok() assertion', async t => {
    await t
        .expect({}).ok()
        .expect(false).ok();
});

test('.notOk() assertion', async t => {
    await t
        .expect(false).notOk()
        .expect(1).notOk();
});

test('.contains() assertion', async t => {
    await t
        .expect('heyyo').contains('hey')
        .expect([1, 2, 3]).contains(4);
});

test('.notContains() assertion', async t => {
    await t
        .expect([1, 2, 3]).notContains(4)
        .expect('answer42').notContains('42');
});

test('.typeOf() assertion', async t => {
    await t
        .expect(void 0).typeOf('undefined')
        .expect('hey').typeOf('string')
        .expect(42).typeOf('function');
});

test('.notTypeOf() assertion', async t => {
    await t
        .expect(void 0).notTypeOf('string')
        .expect('hey').notTypeOf('number')
        .expect(42).notTypeOf('number');
});

test('.gt() assertion', async t => {
    await t
        .expect(42).gt(32)
        .expect(42).gt(42);
});

test('.gte() assertion', async t => {
    await t
        .expect(42).gte(32)
        .expect(42).gte(42)
        .expect(42).gte(53);
});

test('.lt() assertion', async t => {
    await t
        .expect(32).lt(42)
        .expect(42).lt(42);
});

test('.lte() assertion', async t => {
    await t
        .expect(32).lte(42)
        .expect(42).lte(42)
        .expect(42).lte(12);
});

test('.within() assertion', async t => {
    await t
        .expect(2.3).within(2, 3)
        .expect(4.5).within(4.6, 7);
});

test('.notWithin() assertion', async t => {
    await t
        .expect(4.5).notWithin(4.6, 7)
        .expect(2.3).notWithin(2, 3);
});

test('Selector result assertion', async t => {
    const el = Selector('#el1');

    await t
        .click('#makeFloat')
        .expect(el.getStyleProperty('float')).eql('left')
        .click('#setClass')
        .expect(el.hasClass('hey')).ok()
        .click('#setAttr')
        .expect(el.getAttribute('checked')).ok()
        .click('#setTextContent')
        .expect(el.textContent).eql('42');
});

test('Selector result assertion timeout', async t => {
    const el = Selector('#el1');

    await t
        .click('#makeFloat')
        .expect(el.getStyleProperty('float')).eql('left');
});

test('Missing await', async t => {
    t.expect(42).eql(43);
});


test('"timeout" option', async t => {
    const el = Selector('#el1');

    await t
        .click('#makeFloat')
        .expect(el.getStyleProperty('float')).eql('left', {timeout: 500})
        .click('#setClass')
        .expect(el.hasClass('hey')).ok('message', {timeout: 500});
});

test('.match() assertion', async t => {
    await t
        .expect('42 hey').match(/\d+ hey/)
        .expect('yo').match(/[x,z]o/);
});

test('.notMatch() assertion', async t => {
    await t
        .expect('yo').notMatch(/[x,z]o/)
        .expect('42 hey').notMatch(/\d+ hey/);
});

test('ClientFunction result assertion', async t => {
    const getSomeVar = ClientFunction(() => window.location);

    await t.expect(getSomeVar()).eql(2);
});


test('Incorrect action option', async t => {
    await t.click('#btn', {offsetX: -3.5});
});

test('Click button', async t => {
    await t.click('#btn');
});

test('Click without offset options', async t => {
    await t.click('#div');
});

test('Error in selector', async t => {
    await t.click(() => {
        throw new Error('yo');
    });
});


test('Double click on a button', async t => {
    await t.doubleClick('#button');
});

test('Drag to offset', async t => {
    await t.drag('#draggable-div-1', 10, 20, {
        'offsetX': 10,
        'offsetY': 10
    });
});

test('Drag to offset with incorrect dragOffsetX', async t => {
    await t.drag('#draggable-div-1', NaN, 20);
});

test('Drag to offset with incorrect dragOffsetY', async t => {
    await t.drag('#draggable-div-1', 10, 3.14);
});

test('Drag to element', async t => {
    await t.dragToElement('#draggable-div-2', '#destination-div', {
        'offsetX': 10,
        'offsetY': 10
    });
});

test('Drag to element with incorrect selector', async t => {
    await t.dragToElement(void 0, '#destination-div');
});

test('Drag to element with incorrect destinationSelector', async t => {
    await t.dragToElement('#draggable-div-2', null);
});

test('Drag to element with destination offsets', async t => {
    await t.dragToElement('#draggable-div-2', '#destination-div', {destinationOffsetX: 0, destinationOffsetY: 0})
});

test('Destination element selector returns text node', async t => {
    const getDocument = Selector(() => document);

    await t.dragToElement('#draggable-div-2', getDocument);
});

test('Get UA', async t => {
    throw await t.eval(() => navigator.userAgent);
});

const getById = ClientFunction(id => document.getElementById(id));


test('Eval with dependencies', async t => {
    const answer = await t.eval(() => getById('answer'), {dependencies: {getById}});

    expect(answer).eql('42');
});


test('Error during execution', async t => {
    await t.eval(() => {
        throw new Error('Hi there!');
    });
});

test('Hover over containers', async t => {
    await t.hover('#container1');
    await t.hover('#container2');
});


const getBtnClickCount = ClientFunction(() => window);
const getIframeBtnClickCount = ClientFunction(() => window);
const getNestedIframeBtnClickCount = ClientFunction(() => window);

test('Click on an element in an iframe and return to the main window', async t => {
    await t
        .switchToIframe('#iframe')
        .click('#btn')
        .switchToMainWindow()
        .click('#btn');

    const btnClickCount = await getBtnClickCount();
    const iframeBtnClickCount = await getIframeBtnClickCount();

    expect(btnClickCount).eql(1);
    expect(iframeBtnClickCount).eql(1);
});

test('Click on element in a nested iframe', async t => {
    await t
        .switchToIframe('#iframe')
        .switchToIframe('#iframe')
        .click('#btn')
        .switchToMainWindow()
        .click('#btn');

    var btnClickCount = await getBtnClickCount();
    const nestedIframeBtnClickCount = await getNestedIframeBtnClickCount();

    expect(btnClickCount).eql(1);
    expect(nestedIframeBtnClickCount).eql(1);

    await t
        .switchToIframe('#iframe')
        .click('#btn')
        .switchToMainWindow()
        .click('#btn');

    btnClickCount = await getBtnClickCount();
    const iframeBtnClickCount = await getIframeBtnClickCount();

    expect(btnClickCount).eql(2);
    expect(iframeBtnClickCount).eql(1);
});

test('Switch to a non-existent iframe', async t => {
    await t.switchToIframe('#non-existent');
});

test('Click in a slowly loading iframe', async t => {
    await t
        .switchToIframe('#slowly-loading-iframe')
        .click('#btn');

    const iframeBtnClickCount = await ClientFunction(() => window.top)();

    expect(iframeBtnClickCount).eql(1);
});

test('Try to switch to an incorrect element', async t => {
    await t.switchToIframe('body');
});

test('Remove an iframe during execution', async t => {
    await t
        .switchToIframe('#iframe')
        .click('#remove-from-parent-btn')
        .switchToMainWindow()
        .click('#btn');

    const btnClickCount = await getBtnClickCount();

    expect(btnClickCount).eql(1);
});

test('Click in a removed iframe', async t => {
    await t
        .switchToIframe('#iframe')
        .click('#remove-from-parent-btn')
        .click('#btn');
});

test('Click in an iframe with redirect', async t => {
    const getSecondPageBtnClickCount = ClientFunction(() => window);
    const getNestedSecondPageBtnClickCount = ClientFunction(() => window);

    await t
        .switchToIframe('#iframe')
        .switchToIframe('#iframe')
        .click('#link')
        .click('#nested-second-page-btn');

    const nestedSecondPageBtnClickCount = await getNestedSecondPageBtnClickCount();

    await t
        .switchToMainWindow()
        .switchToIframe('#iframe')
        .click('#link')
        .click('#second-page-btn');

    const secondPageBtnClickCount = await getSecondPageBtnClickCount();

    expect(nestedSecondPageBtnClickCount).eql(1);
    expect(secondPageBtnClickCount).eql(1);
});

test('Reload the main page from an iframe', async t => {
    await t
        .switchToIframe('#iframe')
        .click('#reload-top-page-btn')
        .click('#btn')
        .switchToMainWindow();

    const iframeBtnClickCount = await getIframeBtnClickCount();

    expect(iframeBtnClickCount).eql(1);
});

test('Remove the parent iframe from the nested one', async t => {
    await t
        .switchToIframe('#iframe')
        .switchToIframe('#iframe')
        .click('#remove-parent-iframe-btn')
        .switchToMainWindow()
        .click('#btn');

    const btnClickCount = await getBtnClickCount();

    expect(btnClickCount).eql(1);
});

test('Click in an iframe without src', async t => {
    const getIframeWithoutSrcBtnClickCount = ClientFunction(() => window.top);

    await t
        .click('#fill-iframe-without-src')
        .switchToIframe('#iframe-without-src')
        .click('#btn')
        .switchToMainWindow()
        .click('#btn');

    const btnClickCount = await getBtnClickCount();
    const iframeWithoutSrcBtnClickCount = await getIframeWithoutSrcBtnClickCount();

    expect(btnClickCount).eql(1);
    expect(iframeWithoutSrcBtnClickCount).eql(1);
});

test('Click in a cross-domain iframe with redirect', async t => {
    const getSecondPageBtnClickCount = ClientFunction(() => window);

    await t
        .switchToIframe('#cross-domain-iframe')
        .click('#link')
        .click('#second-page-btn');

    const secondPageBtnClickCount = await getSecondPageBtnClickCount();

    await t
        .switchToMainWindow()
        .click('#btn');

    const btnClickCount = await getBtnClickCount();

    expect(btnClickCount).eql(1);
    expect(secondPageBtnClickCount).eql(1);
});

test("Click in a iframe that's loading too slowly", async t => {
    await t
        .switchToIframe('#too-slowly-loading-iframe')
        .click('#btn');

    const iframeBtnClickCount = await ClientFunction(() => window.top)();

    expect(iframeBtnClickCount).eql(1);
});

test('Click in an invisible iframe', async t => {
    await t
        .switchToIframe('#iframe')
        .click('#hide-iframe-btn')
        .click('#btn');
});

test('Click in an iframe that is not loaded', async t => {
    await t
        .switchToIframe('#iframe')
        .click('#too-long-loading-page-link')
        .wait(3000)
        .click('#second-page-btn');
});

test('Maximize window', async t => {
    await t.maximizeWindow();
});


const getResult = ClientFunction(() => document.getElementById('result').textContent);
const pageUrl = 'http://localhost:3000/fixtures/api/es-next/native-dialogs-handling/pages/index.html';
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
        .setNativeDialogHandler((type, text) => dialogHandler(type, text), {dependencies: {dialogHandler}})
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

    expect(info).to.deep.equal([{type: 'beforeunload', text: 'Before unload', url: pageUrl}]);
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
            url: promptPageUrl
        },
        {
            type: 'alert',
            text: 'Alert!',
            url: pageUrl
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

    expect(info).to.deep.equal([{type: 'alert', text: 'Alert!', url: pageUrl}]);
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

const getLocation = ClientFunction(() => window.location.toString().toLowerCase().replace(/\/\/\//g, '//'));

test('Navigate to absolute http page', async t => {
    await t
        .navigateTo('http://localhost:3000/fixtures/api/es-next/navigate-to-and-test-page/pages/navigation.html')
        .click('#button')
        .expect(getLocation()).eql('http://localhost:3000/fixtures/api/es-next/navigate-to-and-test-page/pages/navigation.html');
});

test('Navigate to relative http page', async t => {
    await t
        .navigateTo('navigation.html')
        .click('#button')
        .expect(getLocation()).eql('http://localhost:3000/fixtures/api/es-next/navigate-to-and-test-page/pages/navigation.html');
});

test('Navigate to scheme-less http page', async t => {
    await t
        .navigateTo('//localhost:3000/fixtures/api/es-next/navigate-to-and-test-page/pages/navigation.html')
        .click('#button')
        .expect(getLocation()).eql('http://localhost:3000/fixtures/api/es-next/navigate-to-and-test-page/pages/navigation.html');
});

const focusInput = ClientFunction(() => document.getElementById('input').focus());
const getInputValue = ClientFunction(() => (<HTMLInputElement>document.getElementById('input')).value);

test('Press keys', async t => {
    await focusInput();
    await t.pressKey('right shift+right shift+right delete');
    expect(await getInputValue()).equals('vue');
});


test('Resize the window', async t => {
    await t.resizeWindow(150, 300);
});

test('Incorrect action height argument', async t => {
    await t.resizeWindow(500, -5);
});

test('Resize the window to fit a device', async t => {
    await t.resizeWindowToFitDevice('iPhone');
});

test('Resize the window to fit a device with portrait orientation', async t => {
    await t.resizeWindowToFitDevice('iPhone', {portraitOrientation: true});
});

test('Right click button', async t => {
    await t.rightClick('#button');
});


test('Select text in input', async t => {
    await t
        .selectText('#input', 2, 4)
        .selectText('#input', 2)
        .selectText('#input');
});

test('Select content in textarea', async t => {
    await t
        .selectTextAreaContent('#textarea', 0, 2, 1, 3)
        .selectTextAreaContent('#textarea', 0, 2, 1)
        .selectTextAreaContent('#textarea', 0, 2)
        .selectTextAreaContent('#textarea', 1)
        .selectTextAreaContent('#textarea');
});

test('Select editable content', async t => {
    await t.selectEditableContent('#p1', '#p2');
});


test('Take a screenshot with a custom path (DOS separator)', async t => {

    await t.takeScreenshot('custom\\' + 123 + '.png');
});


test('Take a screenshot in quarantine mode', async t => {
    await t
        .takeScreenshot()
        .click('.notExist');
});


test('Type text in input', async t => {
    await t.typeText('#input', 'a', {replace: true});
});


test('Upload the file', async t => {
    await t
        .setFilesToUpload('#file', '../test-data/file1.txt')
        .click('#submit');
});

test('Clear the upload', async t => {
    await t
        .setFilesToUpload('#file', '../test-data/file1.txt')
        .clearUpload('#file')
        .click('#submit');
});

test('Wait', async t => {
    await t
        .click('#button1')
        .wait(2000)
        .click('#button2');
});

test('Chaining', async t => {
    await t
        .click('#btn1')
        .click('#btn2');

    await t
        .click('#btn3')
        .click('#page2-btn1')
        .click('#page2-btn2');
});

test('Chaining callsites', async t => {
    await t
        .click('#btn1')
        .click('#btn2')
        .click('#error')
        .click('#btn3');
});

test('t.getBrowserConsoleMessages', async t => {
    let messages = await t.getBrowserConsoleMessages();

    await t
        .expect(messages.error).eql(['error1'])
        .expect(messages.warn).eql(['warn1'])
        .expect(messages.log).eql(['log1'])
        .expect(messages.info).eql(['info1'])

        .click('#trigger-messages')

        // Check the driver keeps the messages between page reloads
        .click('#reload');

    messages = await t.getBrowserConsoleMessages();

    await t
        .expect(messages.error).eql(['error1', 'error2'])
        .expect(messages.warn).eql(['warn1', 'warn2'])
        .expect(messages.log).eql(['log1', 'log2'])
        .expect(messages.info).eql(['info1', 'info2']);
});

test('messages formatting', async t => {
    // Several arguments
    await t.eval(() => console.log('a', 1, null, void 0, ['b', 2], {c: 3}));

    const messages = await t.getBrowserConsoleMessages();

    await t
        .expect(messages.log[0]).eql('a 1 null undefined b,2 [object Object]')
        .expect(messages.info.length).eql(0)
        .expect(messages.warn.length).eql(0)
        .expect(messages.error.length).eql(0);
});