// NOTE: to preserve callsites, add new tests AFTER the existing ones
import { ClientFunction } from 'testcafe';
import { expect } from 'chai';


fixture `Iframe switching`
    .page `http://localhost:3000/fixtures/api/es-next/iframe-switching/pages/index.html`;


const getBtnClickCount             = ClientFunction(() => window.btnClickCount);
const getIframeBtnClickCount       = ClientFunction(() => window.iframeBtnClickCount);
const getNestedIframeBtnClickCount = ClientFunction(() => window.nestedIframeBtnClickCount);

test('Click on an element in an iframe and return to the main window', async t => {
    await t
        .switchToIframe('#iframe')
        .click('#btn')
        .switchToMainWindow()
        .click('#btn');

    const btnClickCount       = await getBtnClickCount();
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

    var btnClickCount               = await getBtnClickCount();
    const nestedIframeBtnClickCount = await getNestedIframeBtnClickCount();

    expect(btnClickCount).eql(1);
    expect(nestedIframeBtnClickCount).eql(1);

    await t
        .switchToIframe('#iframe')
        .click('#btn')
        .switchToMainWindow()
        .click('#btn');

    btnClickCount             = await getBtnClickCount();
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

    const iframeBtnClickCount = await ClientFunction(() => window.top.iframeBtnClickCount)();

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
    const getSecondPageBtnClickCount       = ClientFunction(() => window.secondPageBtnClickCount);
    const getNestedSecondPageBtnClickCount = ClientFunction(() => window.nestedSecondPageBtnClickCount);

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
    const getIframeWithoutSrcBtnClickCount = ClientFunction(() => window.top.iframeWithoutSrcBtnClickCount);

    await t
        .click('#fill-iframe-without-src')
        .switchToIframe('#iframe-without-src')
        .click('#btn')
        .switchToMainWindow()
        .click('#btn');

    const btnClickCount                 = await getBtnClickCount();
    const iframeWithoutSrcBtnClickCount = await getIframeWithoutSrcBtnClickCount();

    expect(btnClickCount).eql(1);
    expect(iframeWithoutSrcBtnClickCount).eql(1);
});

test('Click in a cross-domain iframe with redirect', async t => {
    const getSecondPageBtnClickCount = ClientFunction(() => window.secondPageBtnClickCount);

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

    const iframeBtnClickCount = await ClientFunction(() => window.top.iframeBtnClickCount)();

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
