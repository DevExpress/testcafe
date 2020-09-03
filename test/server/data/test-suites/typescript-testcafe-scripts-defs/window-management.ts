const parentUrl = 'http://localhost:3000/fixtures/run-options/allow-multiple-windows/pages/api/parent.html';
const child1Url = 'http://localhost:3000/fixtures/run-options/allow-multiple-windows/pages/api/child-1.html';
const child2Url = 'http://localhost:3000/fixtures/run-options/allow-multiple-windows/pages/api/child-2.html';
const child3Url = 'http://localhost:3000/fixtures/run-options/allow-multiple-windows/pages/api/child-3.html';


(async t => {
    await t
        .expect(Selector('h1').innerText).eql('parent')
        .openWindow(child1Url)
        .expect(Selector('h1').innerText).eql('child-1');
})();

(async t => {
    await t
        .expect(Selector('h1').innerText).eql('parent')
        .openWindow(child3Url)
        .openWindow(child1Url)
        .switchToPreviousWindow()
        .expect(Selector('h1').innerText).eql('child-3');
})();

(async t => {
    await t
        .openWindow(child1Url)
        .expect(Selector('h1').innerText).eql('child-1')
        .closeWindow()
        .expect(Selector('h1').innerText).eql('parent');
})();

(async t => {
    const parentWindow  = await t.getCurrentWindow();
    const childWindow   = await t.openWindow(child1Url);
    const currentWindow = await t.getCurrentWindow();
})();

(async t => {
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
})();

(async t => {
    await t.switchToParentWindow();
})();

(async t => {
    await t.switchToWindow({ id: 'unexising_window' });
})();

(async t => {
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
})();

(async t => {
    await t.openWindow(child1Url);
    await t.openWindow(child2Url);

    await t.switchToWindow(w => w.title === 'parent');
    await t.expect(Selector('h1').innerText).eql('parent');

    await t.switchToWindow(w => w.title === 'child-1');
    await t.expect(Selector('h1').innerText).eql('child-1');

    await t.switchToWindow(w => w.title === 'child-2');
    await t.expect(Selector('h1').innerText).eql('child-2');
})();

(async t => {
    await t.switchToWindow(w => w.nonExistingProperty.field === 'parent');
})();

(async t => {
    await t.openWindow(child1Url);

    await t.switchToWindow(() => true);
})();

(async t => {
    await t
        .openWindow(child1Url)
        .openWindow(child2Url)
        .expect(Selector('h1').innerText).eql('child-2')
        .switchToPreviousWindow()
        .expect(Selector('h1').innerText).eql('child-1')
        .switchToPreviousWindow()
        .expect(Selector('h1').innerText).eql('child-2');
})();

(async t => {
    const child2Window = await t
        .openWindow(child1Url)
        .openWindow(child2Url);

    await t.expect(Selector('h1').innerText).eql('child-2')
        .switchToPreviousWindow()
        .expect(Selector('h1').innerText).eql('child-1')
        .closeWindow(child2Window)
        .switchToPreviousWindow();
})();

(async t => {
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
})();

(async t => {
    const child1Window = await t.openWindow(child1Url);

    await t
        .switchToParentWindow()
        .openWindow(child2Url)
        .expect(Selector('h1').innerText).eql('child-2')
        .switchToWindow(child1Window);

    const currentWindow = await t.getCurrentWindow();

    await t
        .expect(Selector('h1').innerText).eql('child-1');
})();

(async t => {
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
})();


(async t => {
    const childWindow = await t.openWindow(child1Url);

    await t
        .switchToParentWindow()
        .closeWindow(childWindow);

    await t.expect(Selector('h1').innerText).eql('parent');
})();

(async t => {
    const childWindow = await t.openWindow(child1Url);

    await t
        .switchToParentWindow()
        .openWindow(child2Url)
        .closeWindow(childWindow)
        .expect(Selector('h1').innerText).eql('child-2');
})();

(async t => {
    const childWindow1 = await t.openWindow(child1Url);

    await t.switchToParentWindow();
    await t.openWindow(child2Url);
    await t.expect(Selector('h1').innerText).eql('child-2');
    await t.closeWindow(childWindow1);
    await t.switchToWindow(childWindow1);
})();

(async t => {
    const childWindow = await t.openWindow(child1Url);

    await t.switchToParentWindow();
    await t.closeWindow(childWindow);
    await t.switchToWindow(childWindow);
})();

(async t => {
    await t.closeWindow({ id: 'unexising_window' });
})();

(async t => {
    await t.openWindow(child1Url);
    await t.closeWindow({ id: 'unexising_window' });
})();


(async t => {
    const childWindow = await t.openWindow(child1Url);

    await t.closeWindow(childWindow);
    await t.closeWindow(childWindow);
})();

(async t => {
    const parentWindow = await t.openWindow(child1Url);

    await t.openWindow(child2Url);
    await t.closeWindow(parentWindow);
})();
