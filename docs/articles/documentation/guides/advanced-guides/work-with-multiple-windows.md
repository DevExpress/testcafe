---
layout: docs
title: Work with Multiple Windows
permalink: /documentation/guides/advanced-guides/work-with-multiple-windows.html
---

# Work with Multiple Windows

The TestCafe API includes methods that open, close, and switch between browser windows. You can work with pop-up windows and OAuth login forms, debug complex multi-window applications, or run multiple instances of the same web app side by side.

>This feature is in beta. You will be unable to take videos and screenshots of child windows. Additionally, multi-window tests can not yet run in cloud browsers.

## Basic use

When your page launches a new window, the test automatically continues in the newly open window. When that window is closed, the test switches back to its parent.

```JavaScript
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

> Whitelist TestCafe pop-up windows before launching your tests in Safari and Internet Explorer. These browsers block all additional windows unless instructed not to.

## Open a new window

Use the t.openWindow method to open a new window:

```JavaScript
import { Selector, ClientFunction } from 'testcafe';

fixture `Test page`
    .page('https://devexpress.github.io/testcafe/example/');

test('Open a new window', async t => {
    await t.openWindow('http://example.com');

    const url = await t.eval(() => document.documentURI);
    await t.expect(url).eql('http://example.com/');
});
```

>All open browser windows share the same cookies and user storage. Support for per-window user sessions will be available at a later date.

## Switch between windows

The  t.switchToWindow method lets you switch between browser windows.

It takes an instance of the Window object as an argument:

```JavaScript
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

You can also pass a predicate with the description of the window you need:

```JavaScript
await t.switchToWindow(w => w.title === 'Example Domain' && w.url.host === 'example.com');
```

Use the t.switchToParentWindow method to access the window's parent:

```JavaScript
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

Use the t.switchToPreviousWindow method to access the second to last open window:

```JavaScript
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

>You cannot orphan open windows. Attempting to close a window with open children will result in an error.

Call the t.closeWindow method without any arguments to close the current window:

```JavaScript
fixture `Example page`
    .page('http://www.example.com');

test('Close the current window', async t => {
    const window1 = await t.openWindow('http://devexpress.com');
    await t.closeWindow();

    const url = await t.eval(() => document.documentURI);
    await t.expect(url).eql('http://www.example.com/');
    });
```

Pass a window object when you call the t.closeWindow method to close a particular window:

```JavaScript
test('Close a specific window', async t => {
    const window1 = await t.openWindow('http://devexpress.com');
    await t.closeWindow(window1);
});
```
