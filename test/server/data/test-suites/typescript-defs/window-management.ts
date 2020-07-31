import { Selector } from 'testcafe';

const parentUrl = 'http://localhost:3000/fixtures/run-options/allow-multiple-windows/pages/api/parent.html';
const child1Url = 'http://localhost:3000/fixtures/run-options/allow-multiple-windows/pages/api/child-1.html';
const child2Url = 'http://localhost:3000/fixtures/run-options/allow-multiple-windows/pages/api/child-2.html';
const child3Url = 'http://localhost:3000/fixtures/run-options/allow-multiple-windows/pages/api/child-3.html';

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
});

test('Switch to parent window', async t => {
    const parentWindow = await t.getCurrentWindow();

    await t
        .openWindow(child1Url)
        .expect(Selector('h1').innerText).eql('child-1');

    let currentWindow = await t.getCurrentWindow();

    currentWindow = await t
        .switchToParentWindow()
        .getCurrentWindow();

    await t
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
               w.url.pathname === '/fixtures/run-options/allow-multiple-windows/pages/api/parent.html' &&
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
        .expect(Selector('h1').innerText).eql('parent')
        .switchToWindow(childWindow);

    currentWindow = await t.getCurrentWindow();
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
