import { expect } from 'chai';

(async () => {
    await t
        .expect({a: 2}).eql({a: 2})
        .expect('hey').eql('yo', 'testMessage');
})();

(async () => {
    await t
        .expect({b: 3}).notEql({b: 4})
        .expect(2).notEql(2);
})();

(async () => {
    await t
        .expect({}).ok()
        .expect(false).ok();
})();

(async () => {
    await t
        .expect(false).notOk()
        .expect(1).notOk();
})();

(async () => {
    await t
        .expect('heyyo').contains('hey')
        .expect([1, 2, 3]).contains([4]);
})();

(async () => {
    await t
        .expect([1, 2, 3]).notContains([4])
        .expect('answer42').notContains('42');
})();

(async () => {
    await t
        .expect(() => true).typeOf('function')
        .expect({}).typeOf('object')
        .expect(1).typeOf('number')
        .expect('string').typeOf('string')
        .expect(true).typeOf('boolean')
        .expect(void 0).typeOf('undefined')
        .expect(null).typeOf('null')
        .expect(new RegExp('regex')).typeOf('regexp')
        .expect(42).typeOf('function');
})();

(async () => {
    await t
        .expect('function').notTypeOf('function')
        .expect('object').notTypeOf('object')
        .expect('number').notTypeOf('number')
        .expect(1).notTypeOf('string')
        .expect('boolean').notTypeOf('boolean')
        .expect('undefined').notTypeOf('undefined')
        .expect('null').notTypeOf('null')
        .expect('regex').notTypeOf('regexp')
        .expect(42).notTypeOf('number');
})();

(async () => {
    await t
        .expect(42).gt(32)
        .expect(42).gt(42);
})();

(async () => {
    await t
        .expect(42).gte(32)
        .expect(42).gte(42)
        .expect(42).gte(53);
})();

(async () => {
    await t
        .expect(32).lt(42)
        .expect(42).lt(42);
})();

(async () => {
    await t
        .expect(32).lte(42)
        .expect(42).lte(42)
        .expect(42).lte(12);
})();

(async () => {
    await t
        .expect(2.3).within(2, 3)
        .expect(4.5).within(4.6, 7);
})();

(async () => {
    await t
        .expect(4.5).notWithin(4.6, 7)
        .expect(2.3).notWithin(2, 3);
})();

(async () => {
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
})();

(async () => {
    const el = Selector('#el1');

    await t
        .click('#makeFloat')
        .expect(el.getStyleProperty('float')).eql('left');
})();

(async () => {
    t.expect(42).eql(43);
})();


(async () => {
    const el = Selector('#el1');

    await t
        .click('#makeFloat')
        .expect(el.getStyleProperty('float')).eql('left', {timeout: 500})
        .click('#setClass')
        .expect(el.hasClass('hey')).ok('message', {timeout: 500});
})();

(async () => {
    await t
        .expect('42 hey').match(/\d+ hey/)
        .expect('yo').match(/[x,z]o/);
})();

(async () => {
    await t
        .expect('yo').notMatch(/[x,z]o/)
        .expect('42 hey').notMatch(/\d+ hey/);
})();

(async () => {
    const getSomeVar = ClientFunction(() => window.location.toString());

    await t.expect(getSomeVar()).eql('https://example.com');
})();


(async () => {
    await t.click('#btn', {offsetX: -3.5});
})();

(async () => {
    await t.click('#btn');
})();

(async () => {
    await t.click('#div');
})();

(async () => {
    await t.click(() => {
        throw new Error('yo');
    });
})();


(async () => {
    await t.doubleClick('#button');
})();

(async () => {
    await t.drag('#draggable-div-1', 10, 20, {
        'offsetX': 10,
        'offsetY': 10
    });
})();

(async () => {
    await t.drag('#draggable-div-1', NaN, 20);
})();

(async () => {
    await t.drag('#draggable-div-1', 10, 3.14);
})();

(async () => {
    await t.dragToElement('#draggable-div-2', '#destination-div', {
        'offsetX': 10,
        'offsetY': 10
    });
})();

(async () => {
    await t.dragToElement(void 0, '#destination-div');
})();

(async () => {
    await t.dragToElement('#draggable-div-2', null);
})();

(async () => {
    await t.dragToElement('#draggable-div-2', '#destination-div', {destinationOffsetX: 0, destinationOffsetY: 0})
})();

(async () => {
    const getDocument = Selector(() => document);

    await t.dragToElement('#draggable-div-2', getDocument);
})();

(async () => {
    throw await t.eval(() => navigator.userAgent);
})();

const getById = ClientFunction((id: string) => document.getElementById(id));


(async () => {
    const answer = await t.eval(() => getById('answer'), {dependencies: {getById}});

    expect(answer).eql('42');
})();


(async () => {
    await t.eval(() => {
        throw new Error('Hi there!');
    });
})();

(async () => {
    await t.hover('#container1');
    await t.hover('#container2');
})();


const getBtnClickCount = ClientFunction(() => window);
const getIframeBtnClickCount = ClientFunction(() => window);
const getNestedIframeBtnClickCount = ClientFunction(() => window);

(async () => {
    await t
        .switchToIframe('#iframe')
        .click('#btn')
        .switchToMainWindow()
        .click('#btn');

    const btnClickCount = await getBtnClickCount();
    const iframeBtnClickCount = await getIframeBtnClickCount();

    expect(btnClickCount).eql(1);
    expect(iframeBtnClickCount).eql(1);
})();

(async () => {
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
})();

(async () => {
    await t.switchToIframe('#non-existent');
})();

(async () => {
    await t
        .switchToIframe('#slowly-loading-iframe')
        .click('#btn');

    const iframeBtnClickCount = await ClientFunction(() => window.top)();

    expect(iframeBtnClickCount).eql(1);
})();

(async () => {
    await t.switchToIframe('body');
})();

(async () => {
    await t
        .switchToIframe('#iframe')
        .click('#remove-from-parent-btn')
        .switchToMainWindow()
        .click('#btn');

    const btnClickCount = await getBtnClickCount();

    expect(btnClickCount).eql(1);
})();

(async () => {
    await t
        .switchToIframe('#iframe')
        .click('#remove-from-parent-btn')
        .click('#btn');
})();

(async () => {
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
})();

(async () => {
    await t
        .switchToIframe('#iframe')
        .click('#reload-top-page-btn')
        .click('#btn')
        .switchToMainWindow();

    const iframeBtnClickCount = await getIframeBtnClickCount();

    expect(iframeBtnClickCount).eql(1);
})();

(async () => {
    await t
        .switchToIframe('#iframe')
        .switchToIframe('#iframe')
        .click('#remove-parent-iframe-btn')
        .switchToMainWindow()
        .click('#btn');

    const btnClickCount = await getBtnClickCount();

    expect(btnClickCount).eql(1);
})();

(async () => {
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
})();

(async () => {
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
})();

(async () => {
    await t
        .switchToIframe('#too-slowly-loading-iframe')
        .click('#btn');

    const iframeBtnClickCount = await ClientFunction(() => window.top)();

    expect(iframeBtnClickCount).eql(1);
})();

(async () => {
    await t
        .switchToIframe('#iframe')
        .click('#hide-iframe-btn')
        .click('#btn');
})();

(async () => {
    await t
        .switchToIframe('#iframe')
        .click('#too-long-loading-page-link')
        .wait(3000)
        .click('#second-page-btn');
})();

(async () => {
    await t.maximizeWindow();
})();


const getResult = ClientFunction(() => document.getElementById('result').textContent);
const pageUrl = 'http://localhost:3000/fixtures/api/es-next/native-dialogs-handling/pages/index.html';
const promptPageUrl = 'http://localhost:3000/fixtures/api/es-next/native-dialogs-handling/pages/prompt.html';


(async () => {
    var info = await t.getNativeDialogHistory();

    expect(info.length).equals(0);

    await t.click('#buttonConfirm');
})();

(async () => {
    await t
        .setNativeDialogHandler((type, text) => {
            if (type === 'confirm' && text === 'Confirm?')
                return true;

            return null;
        })
        .click('#buttonConfirm');

    expect(await getResult()).equals('true');
})();

(async () => {
    var dialogHandler = ClientFunction((type: string, text: string) => {
        if (type === 'confirm' && text === 'Confirm?')
            return true;

        return null;
    });

    await t
        .setNativeDialogHandler((type, text) => dialogHandler(type, text), {dependencies: {dialogHandler}})
        .click('#buttonConfirm');

    expect(await getResult()).equals('true');
})();

(async () => {
    var dialogHandler = ClientFunction((type: string, text: string) => {
        if (type === 'confirm' && text === 'Confirm?')
            return true;

        return null;
    });

    await t
        .setNativeDialogHandler(dialogHandler)
        .click('#buttonConfirm');

    expect(await getResult()).equals('true');
})();

(async () => {
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
})();

(async () => {
    await t
        .setNativeDialogHandler(() => {
            throw new Error('Wrong dialog text');
        })
        .click('#buttonConfirm');

    expect(await getResult()).equals('true');
})();

(async () => {
    await t
        .click('#withoutDialog')
        .setNativeDialogHandler(() => true);

    var info = await t.getNativeDialogHistory();

    expect(info.length).equals(1);
})();

(async () => {
    await t
        .setNativeDialogHandler(() => {
        })
        .click('#enableBeforeUnload')
        .click('#linkToThisPage');

    var info = await t.getNativeDialogHistory();

    expect(info).to.deep.equal([{type: 'beforeunload', text: 'Before unload', url: pageUrl}]);
})();

(async () => {
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
})();

(async () => {
    await t.click('#linkToPromptPage');
})();

//Dialogs during wait command execution
(async () => {
    await t
        .setNativeDialogHandler(() => null)
        .click('#buttonDialogAfterTimeout')
        .wait(2000);

    var info = await t.getNativeDialogHistory();

    expect(info).to.deep.equal([{type: 'alert', text: 'Alert!', url: pageUrl}]);
})();

(async () => {
    await t
        .setNativeDialogHandler(() => null)
        .click('#buttonDialogAfterTimeout')
        .wait(10);

    var info = await t.getNativeDialogHistory();

    expect(info.length).equals(1);
})();

(async () => {
    await t
        .click('#buttonDialogAfterTimeout')
        .wait(2000);
})();

(async () => {
    var dialogHandler = Selector(() => document.body);

    await t.setNativeDialogHandler(dialogHandler);
})();


(async () => {
    await t
        .setNativeDialogHandler(() => true)
        .click('#buttonAlert')
        .setNativeDialogHandler(null)
        .click('#buttonAlert');
})();

const getLocation = ClientFunction(() => window.location.toString().toLowerCase().replace(/\/\/\//g, '//'));

(async () => {
    await t
        .navigateTo('http://localhost:3000/fixtures/api/es-next/navigate-to-and-test-page/pages/navigation.html')
        .click('#button')
        .expect(getLocation()).eql('http://localhost:3000/fixtures/api/es-next/navigate-to-and-test-page/pages/navigation.html');
})();

(async () => {
    await t
        .navigateTo('navigation.html')
        .click('#button')
        .expect(getLocation()).eql('http://localhost:3000/fixtures/api/es-next/navigate-to-and-test-page/pages/navigation.html');
})();

(async () => {
    await t
        .navigateTo('//localhost:3000/fixtures/api/es-next/navigate-to-and-test-page/pages/navigation.html')
        .click('#button')
        .expect(getLocation()).eql('http://localhost:3000/fixtures/api/es-next/navigate-to-and-test-page/pages/navigation.html');
})();

const focusInput = ClientFunction(() => document.getElementById('input').focus());
const getInputValue = ClientFunction(() => (<HTMLInputElement>document.getElementById('input')).value);

(async () => {
    await focusInput();
    await t.pressKey('right shift+right shift+right delete');
    expect(await getInputValue()).equals('vue');
})();


(async () => {
    await t.resizeWindow(150, 300);
})();

(async () => {
    await t.resizeWindow(500, -5);
})();

(async () => {
    await t.resizeWindowToFitDevice('iPhone');
})();

(async () => {
    await t.resizeWindowToFitDevice('iPhone', {portraitOrientation: true});
})();

(async () => {
    await t.rightClick('#button');
})();


(async () => {
    await t
        .selectText('#input', 2, 4)
        .selectText('#input', 2)
        .selectText('#input');
})();

(async () => {
    await t
        .selectTextAreaContent('#textarea', 0, 2, 1, 3)
        .selectTextAreaContent('#textarea', 0, 2, 1)
        .selectTextAreaContent('#textarea', 0, 2)
        .selectTextAreaContent('#textarea', 1)
        .selectTextAreaContent('#textarea');
})();

(async () => {
    await t.selectEditableContent('#p1', '#p2');
})();


(async () => {

    await t.takeScreenshot('custom\\' + 123 + '.png');
})();


(async () => {
    await t
        .takeScreenshot()
        .click('.notExist');
})();


(async () => {
    await t.typeText('#input', 'a', {replace: true});
})();


(async () => {
    await t
        .setFilesToUpload('#file', '../test-data/file1.txt')
        .click('#submit');
})();

(async () => {
    await t
        .setFilesToUpload('#file', '../test-data/file1.txt')
        .clearUpload('#file')
        .click('#submit');
})();

(async () => {
    await t
        .click('#button1')
        .wait(2000)
        .click('#button2');
})();

(async () => {
    await t
        .click('#btn1')
        .click('#btn2');

    await t
        .click('#btn3')
        .click('#page2-btn1')
        .click('#page2-btn2');
})();

(async () => {
    await t
        .click('#btn1')
        .click('#btn2')
        .click('#error')
        .click('#btn3');
})();

(async () => {
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
})();

(async () => {
    // Several arguments
    await t.eval(() => console.log('a', 1, null, void 0, ['b', 2], {c: 3}));

    const messages = await t.getBrowserConsoleMessages();

    await t
        .expect(messages.log[0]).eql('a 1 null undefined b,2 [object Object]')
        .expect(messages.info.length).eql(0)
        .expect(messages.warn.length).eql(0)
        .expect(messages.error.length).eql(0);
})();

(async () => {
    function test (): Promise<void> {
        return t.expect(1).ok();
    }

    test();
})();
