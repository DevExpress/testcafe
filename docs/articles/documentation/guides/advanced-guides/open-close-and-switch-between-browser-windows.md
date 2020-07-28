---
layout: docs
title: Open, close, and switch between browser Windows
permalink: /documentation/guides/advanced-guides/open-close-and-switch-between-browser-windows.html
---
# Open, close, and switch between browser windows

The TestCafe API includes methods that open, close, and switch between browser windows. You can test websites with pop-up windows and OAuth login forms, debug complex multi-window applications, or run multiple instances of the same web app side by side.

>This is a beta feature. Browser support is limited to local instances of Chrome and Firefox. Videos and screenshots of child windows cannot be captured. The available functionality is subject to further revisions. Use at your own risk.

## Handle client-side window events

When your page launches a new window, the test automatically continues in the newly open window. When that window is closed, the test switches back to its parent.

```js
import { Selector } from 'testcafe';

fixture `Login page`
    .page('https://login.wrike.com/login/');

const googleButton = Selector('div.login-panel-footer__login-with > button');

test('Login via Google', async t => {
    await t
        .click(googleButton)
        .typeText('input[type=email]', 'This text will be entered inside the login dialog');
});
```

## Open a new window

Use the [t.openWindow](../../reference/test-api/testcontroller/openwindow.md) method to open a new window:

```js
import { Selector, ClientFunction } from 'testcafe';

fixture `Test page`
    .page('https://devexpress.github.io/testcafe/example/');

test('Open a new window', async t => {
    await t.openWindow('http://example.com');

    const url = await t.eval(() => document.documentURI);
    await t.expect(url).eql('http://example.com/');
});
```

>All open browser windows share the same cookies and user storage. Support for per-window user sessions is not yet available.

## Switch between windows

The [t.switchToWindow](../../reference/test-api/testcontroller/switchtowindow.md) method lets you switch between browser windows.

It takes an instance of the Window object as an argument:

```js
fixture `Example page`
    .page('http://example.com');

test('Switch to a specific window', async t => {
    const initialWindow = await t.getCurrentWindow();
    const window2 = await t.openWindow('http://example1.com');
    const window3 = await t.openWindow('http://example2.com');

    await t.switchToWindow(initialWindow);

    const url = await t.eval(() => document.documentURI);
    await t.expect(url).eql('http://example.com/');
});
```

You can also pass [a predicate](../../reference/test-api/testcontroller/switchtowindow.md#tswitchtowindowpredicate) with the description of the window you need:

```js
await t.switchToWindow(w => w.title === 'Example Domain' && w.url.host === 'example.com');
```

Use the [t.switchToParentWindow](../../reference/test-api/testcontroller/switchtoparentwindow.md) method to access the window's parent:

```js
fixture `Example page`
    .page('http://www.example.com/');

test('Switch to a parent window', async t => {
    await t
        .openWindow('https://devexpress.com')
        .switchToParentWindow();

    const url = await t.eval(() => document.documentURI);
    await t.expect(url).eql('http://www.example.com/');
});
```

Use the [t.switchToPreviousWindow](../../reference/test-api/testcontroller/switchtopreviouswindow.md) method to access the second to last open window:

```js
test('Switch back', async t => {
    await t
        .openWindow('http://www.example.com')
        .openWindow('https://devexpress.com');
        .switchToPreviousWindow();

    const url = await t.eval(() => document.documentURI);
    await t.expect(url).eql('http://www.example.com/');
});
```

## Close an existing window

>You cannot close windows with open children.

Call the [t.closeWindow](../../reference/test-api/testcontroller/closewindow.md) method without parameters to close the currently active window:

```js
fixture `Example page`
    .page('http://www.example.com');

test('Close the current window', async t => {
    const window1 = await t.openWindow('http://devexpress.com');
    await t.closeWindow();

    const url = await t.eval(() => document.documentURI);
    await t.expect(url).eql('http://www.example.com/');
    });

```

Pass a window object when you call the [t.closeWindow](../../reference/test-api/testcontroller/closewindow.md) method to close a particular window:

```js
test('Close a specific window', async t => {
    const window1 = await t.openWindow('http://devexpress.com');
    await t.closeWindow(window1);
});
```
