---
layout: post
title: TestCafe v1.9.0 Released
permalink: /blog/:title.html
---
# TestCafe v1.9.0 Released

We are happy to announce that a beta version of multiple window support ships with `v1.9.0`.

<!--more-->

## Enhancements

### 🌟 Multi Window Support (Beta)

TestCafe can now automate user actions in multiple windows. You can switch between open windows during the test. Make edits in one window and check that the other window's content changes dynamically to reflect these modifications.

![Testing in multiple windows](../images/blog/2020-07-23-multi-window.gif)

When the main window opens a child window, TestCafe automatically switches to this new window and continues test actions there:

```js
import { Selector } from 'testcafe';

fixture `Login page`
    .page('https://login.wrike.com/login/');

const googleButton = Selector('div.login-panel-footer__login-with > button');

test('Login via Google', async t => {
    await t
        .click(googleButton)
        .typeText('input[type=email]', 'This text will be entered inside the pop-up');
});
```

You can use the [t.openWindow]() method to open a child window from test code:

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

The [t.switchToWindow]() method enables you to switch between open windows. You can use a window identifier or a predicate to specify the window that should be activated:

```js
fixture `Example page`
    .page('http://example.com');

test('Switch to a specific window', async t => {
    const initialWindow = await t.getCurrentWindow();
    const popUp1 = await t.openWindow('http://example1.com');
    const popUp2 = await t.openWindow('http://example2.com');

    await t.switchToWindow(initialWindow);

    const url = t.eval(() => document.documentURI);
    await t.expect(url).eql('http://example.com/');

    await t
        .switchToWindow(w => w.location.host === 'example1.com')
        .expect(url).eql('http://example1.com/');
});
```

The [t.switchToParentWindow]() and [t.switchToPreviousWindow]() methods allow you to switch back to the parent window or the previously active window.

The [t.closeWindow]() method closes the current window when called without arguments, or the specified window if you pass an identifier or predicate:

```js
fixture `Example page`
    .page('http://www.example.com');

test('Close the current window', async t => {
    const window1 = await t.openWindow('http://devexpress.com');
    await t.closeWindow();

    const url = await t.eval(() => document.documentURI);
    await t.expect(url).eql('http://www.example.com/');
    });

test('Close a specific window', async t => {
    const window1 = await t.openWindow('http://devexpress.com');
    await t.closeWindow(window1);
});
```

### Detailed Diffs in Failed Assertions

Test run reports now show the differences between an assertion's actual and expected values:

<img srcset="../images/blog/2020-07-23-rich-diffs.png,
            ../images/blog/2020-07-23-rich-diffs@2x.png 2x"
        src="../images/blog/2020-07-23-rich-diffs.png"
        alt="A report showing differences between asserted values"/>

TestCafe can display difference between values, arrays, objects, and even functions.

## Bug Fixes

* ...
