import { Selector, ClientFunction } from 'testcafe';

import {
    saveWindowState,
    restoreWindowState,
    getWindowHeight,
    getWindowWidth
} from '../../../../window-helpers';


const reload = ClientFunction(() => window.location.reload());

const parentUrl = 'http://localhost:3000/fixtures/multiple-windows/pages/api/parent.html';
const child1Url = 'http://localhost:3000/fixtures/multiple-windows/pages/api/child-1.html';
const child2Url = 'http://localhost:3000/fixtures/multiple-windows/pages/api/child-2.html';
const child3Url = 'http://localhost:3000/fixtures/multiple-windows/pages/api/child-3.html';

fixture `API`
    .page(parentUrl);

test('Open child window', async t => {
    await t
        .expect(Selector('h1').innerText).eql('parent')
        .openWindow(child1Url)
        .expect(Selector('h1').innerText).eql('child-1');
});

test('Open slow child window', async t => {
    await t
        .expect(Selector('h1').innerText).eql('parent')
        .openWindow(child3Url)
        .openWindow(child1Url)
        .switchToPreviousWindow()
        .expect(Selector('h1').innerText).eql('child-3');
});

test('Close current window', async t => {
    await t
        .openWindow(child1Url)
        .expect(Selector('h1').innerText).eql('child-1')
        .closeWindow()
        .expect(Selector('h1').innerText).eql('parent');
});

test('Get current window', async t => {
    const parentWindow  = await t.getCurrentWindow();
    const childWindow   = await t.openWindow(child1Url);
    const currentWindow = await t.getCurrentWindow();

    await t.expect(parentWindow.id).ok();
    await t.expect(childWindow.id).ok();
    await t.expect(parentWindow.id).notEql(childWindow.id);
    await t.expect(currentWindow.id).eql(childWindow.id);
});

test('Switch to parent window', async t => {
    const parentWindow = await t.getCurrentWindow();

    await t
        .openWindow(child1Url)
        .expect(Selector('h1').innerText).eql('child-1');

    let currentWindow = await t.getCurrentWindow();

    await t.expect(currentWindow.id).notEql(parentWindow.id);

    currentWindow = await t
        .switchToParentWindow()
        .getCurrentWindow();

    await t
        .expect(currentWindow.id).eql(parentWindow.id)
        .expect(Selector('h1').innerText).eql('parent');
});

test('Switch to unexisting parent window', async t => {
    await t.switchToParentWindow();
});

test('Switch to unexisting window', async t => {
    await t.switchToWindow({ id: 'unexising_window' });
});

test('Switch to window by url', async t => {
    await t.openWindow(child1Url);

    await t.switchToWindow(w => {
        return w.url instanceof URL &&
               w.url.href === parentUrl &&
               w.url.protocol === 'http:' &&
               w.url.origin === 'http://localhost:3000' &&
               w.url.host === 'localhost:3000' &&
               w.url.hostname === 'localhost' &&
               w.url.port === '3000' &&
               w.url.pathname === '/fixtures/multiple-windows/pages/api/parent.html' &&
               w.url.searchParams instanceof URLSearchParams;
    });

    await t.expect(Selector('h1').innerText).eql('parent');

    await t.switchToWindow(w => w.url.toString() === child1Url);

    await t.expect(Selector('h1').innerText).eql('child-1');
});

test('Switch to window by title', async t => {
    await t.openWindow(child1Url);
    await t.openWindow(child2Url);

    await t.switchToWindow(w => w.title === 'parent');
    await t.expect(Selector('h1').innerText).eql('parent');

    await t.switchToWindow(w => w.title === 'child-1');
    await t.expect(Selector('h1').innerText).eql('child-1');

    await t.switchToWindow(w => w.title === 'child-2');
    await t.expect(Selector('h1').innerText).eql('child-2');
});

test('Switch to window by predicate with error', async t => {
    await t.switchToWindow(w => w.nonExistingProperty.field === 'parent');
});

test('Multiple windows are found warning', async t => {
    await t.openWindow(child1Url);

    await t.switchToWindow(() => true);
});

test('Switch to previous window', async t => {
    await t
        .openWindow(child1Url)
        .openWindow(child2Url)
        .expect(Selector('h1').innerText).eql('child-2')
        .switchToPreviousWindow()
        .expect(Selector('h1').innerText).eql('child-1')
        .switchToPreviousWindow()
        .expect(Selector('h1').innerText).eql('child-2');
});

test('Switch to previous closed window', async t => {
    const child2Window = await t
        .openWindow(child1Url)
        .openWindow(child2Url);

    await t.expect(Selector('h1').innerText).eql('child-2')
        .switchToPreviousWindow()
        .expect(Selector('h1').innerText).eql('child-1')
        .closeWindow(child2Window)
        .switchToPreviousWindow();
});

test('Switch to child window', async t => {
    let currentWindow = null;

    const parentWindow = await t.getCurrentWindow();
    const childWindow  = await t.openWindow(child1Url);

    await t.expect(Selector('h1').innerText).eql('child-1');

    currentWindow = await t
        .switchToParentWindow()
        .getCurrentWindow();

    await t
        .expect(currentWindow.id).eql(parentWindow.id)
        .expect(Selector('h1').innerText).eql('parent')
        .switchToWindow(childWindow);

    currentWindow = await t.getCurrentWindow();

    await t.expect(currentWindow.id).eql(childWindow.id)
        .expect(Selector('h1').innerText).eql('child-1');
});

test('Switch to other child', async t => {
    const child1Window = await t.openWindow(child1Url);

    await t
        .switchToParentWindow()
        .openWindow(child2Url)
        .expect(Selector('h1').innerText).eql('child-2')
        .switchToWindow(child1Window);

    const currentWindow = await t.getCurrentWindow();

    await t
        .expect(currentWindow.id).eql(child1Window.id)
        .expect(Selector('h1').innerText).eql('child-1');
});

test('Switch to deep child', async t => {
    const parentWindow = await t.getCurrentWindow();

    const child2Window = await t
        .openWindow(child1Url)
        .openWindow(child1Url)
        .openWindow(child2Url);


    await t
        .switchToWindow(parentWindow)
        .openWindow(child1Url)
        .openWindow(child1Url)
        .openWindow(child1Url)
        .switchToWindow(child2Window);

    const currentWindow = await t.getCurrentWindow();

    await t
        .expect(currentWindow.id).eql(child2Window.id)
        .expect(Selector('h1').innerText).eql('child-2');
});


test('Close specific window from parent', async t => {
    const childWindow = await t.openWindow(child1Url);

    await t
        .switchToParentWindow()
        .closeWindow(childWindow);

    await t.expect(Selector('h1').innerText).eql('parent');
});

test('Close window and check master did not changed', async t => {
    const childWindow = await t.openWindow(child1Url);

    await t
        .switchToParentWindow()
        .openWindow(child2Url)
        .closeWindow(childWindow)
        .expect(Selector('h1').innerText).eql('child-2');
});

test('Close specific window from child', async t => {
    const childWindow1 = await t.openWindow(child1Url);

    await t.switchToParentWindow();
    await t.openWindow(child2Url);
    await t.expect(Selector('h1').innerText).eql('child-2');
    await t.closeWindow(childWindow1);
    await t.switchToWindow(childWindow1);
});

test('Close specific window and switch to it', async t => {
    const childWindow = await t.openWindow(child1Url);

    await t.switchToParentWindow();
    await t.closeWindow(childWindow);
    await t.switchToWindow(childWindow);
});

test('Close unexisting window', async t => {
    await t.closeWindow({ id: 'unexising_window' });
});

test('Close unexisting child window', async t => {
    await t.openWindow(child1Url);
    await t.closeWindow({ id: 'unexising_window' });
});


test('Close closed window', async t => {
    const childWindow = await t.openWindow(child1Url);

    await t.closeWindow(childWindow);
    await t.closeWindow(childWindow);
});

test('Close parent window and catch error', async t => {
    const parentWindow = await t.openWindow(child1Url);

    await t.openWindow(child2Url);
    await t.closeWindow(parentWindow);
});

test('Close window without parent', async t => {
    await t.closeWindow();
});

test('Open window with `disableMultipleWindows` option', async t => {
    await t.openWindow(child1Url);
});

test('Refresh parent and switch to child', async t => {
    await t.openWindow(child1Url);

    await t.switchToParentWindow();

    await reload();
    await reload();
    await reload();

    await t.switchToPreviousWindow();
});

test('Refresh parent and remove child', async t => {
    const child = await t.openWindow(child1Url);

    await t.switchToParentWindow();

    await reload();
    await reload();
    await reload();

    await t.closeWindow(child);
});

test('Refresh parent with multiple children', async t => {
    await t.openWindow(child1Url);
    await t.switchToParentWindow();
    await t.openWindow(child1Url);
    await t.switchToParentWindow();
    await t.openWindow(child1Url);
    await t.switchToParentWindow();

    await reload();
    await reload();
    await reload();

    await t.switchToPreviousWindow();
});

test('Refresh child and close', async t => {
    await t.openWindow(child1Url);

    await reload();

    await t.closeWindow();
});

test('Refresh child and switch to parent', async t => {
    await t.openWindow(child1Url);

    await reload();

    await t.switchToParentWindow();
});

fixture `Resize multiple windows`
    .page(parentUrl)
    .beforeEach(async t => {
        await saveWindowState(t);
    })
    .afterEach(async t => {
        await restoreWindowState(t);
    });

test('Resize multiple windows', async t => {
    await t.resizeWindow(900, 900);
    await t.expect(await getWindowWidth()).eql(900);
    await t.expect(await getWindowHeight()).eql(900);

    await t.openWindow(child1Url);

    await t.resizeWindow(550, 550);
    await t.expect(await getWindowWidth()).eql(550);
    await t.expect(await getWindowHeight()).eql(550);

    await t.switchToParentWindow();

    await t.expect(await getWindowWidth()).eql(900);
    await t.expect(await getWindowHeight()).eql(900);

    await t.resizeWindow(500, 500);

    await t.expect(await getWindowWidth()).eql(500);
    await t.expect(await getWindowHeight()).eql(500);
});

test('Maximize multiple windows', async t => {
    // NOTE: to be sure that window is is maximized we check
    // that the width/height value increased at least on 10px
    const e = 10;

    await t.resizeWindow(600, 600);

    const parentWidth  = await getWindowWidth();
    const parentHeight = await getWindowHeight();

    await t.openWindow(child1Url);

    const childWidth  = await getWindowWidth();
    const childHeight = await getWindowHeight();

    await t.maximizeWindow();

    const maxChildWidth  = await getWindowWidth();
    const maxChildHeight = await getWindowHeight();

    await t.expect(maxChildWidth).gt(childWidth + e);
    await t.expect(maxChildHeight).gt(childHeight + e);

    await t.switchToParentWindow();

    await t.maximizeWindow();

    const maxParentWidth  = await getWindowWidth();
    const maxParentHeight = await getWindowHeight();

    await t.expect(maxParentWidth).gt(parentWidth + e);
    await t.expect(maxParentHeight).gt(parentHeight + e);
});
