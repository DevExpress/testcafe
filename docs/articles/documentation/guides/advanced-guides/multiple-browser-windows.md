---
layout: docs
title: Multiple Browser Windows
permalink: /documentation/guides/advanced-guides/multiple-browser-windows.html
---
# Multiple Browser Windows

The TestCafe API includes methods that open, close, and switch between browser windows. You can test websites with pop-up windows and OAuth login forms, debug complex multi-window applications, or run multiple instances of the same web app side-by-side.

> Important! Multi-window mode is not supported in all browsers. See [Supported Browsers](#supported-browsers).

## Automatic Switch to New Windows

When your page launches a new window, the test automatically continues in the newly opened window. When that window is closed, the test switches back to its parent.

```js
import { Selector } from 'testcafe';

fixture `Microsoft DevBlogs Login page`
    .page('https://devblogs.microsoft.com/');

test('automatically change execution context', async t => {
   await t
    .click('.login-but') // click the login button
    .click('.nsl-button-google') // open Google's OAuth window
    .typeText('#identifierId', 'login@google.com') // enter the username
    .click('#identifierNext')
    .typeText('input[type=password]', 'mypassword') // enter the password
    .click('#passwordNext')
    .expect(Selector('.login-section').textContent).contains('Your first name');  // you're logged in!
});

```

## Open a New Window

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

>Browser windows share the client-side storage. Only one [user role](https://devexpress.github.io/testcafe/documentation/guides/advanced-guides/authentication.html#user-roles) can be active at a time.

## Obtain Window Descriptors

Window descriptors are objects that reference individual browser windows. Window descriptors can be used to distinguish between different windows.

The [t.openWindow](../../reference/test-api/testcontroller/openwindow.md) method returns a window descriptor for the newly open window.

The [t.getCurrentWindow](../../reference/test-api/testcontroller/getcurrentwindow.md) method returns a window descriptor for the active window. Use it to obtain descriptors for windows that open without a [t.openWindow](../../reference/test-api/testcontroller/openwindow.md) call, for example, the initial browser window.

```js
fixture `Example page`
    .page('http://example.com');

test('Generate window descriptors', async t => {
    const initialWindow = await t.getCurrentWindow();
    const window2 = await t.openWindow('http://devexpress.com');
    });
```

## Switch Between Windows

The [t.switchToWindow](../../reference/test-api/testcontroller/switchtowindow.md) method allows you to switch between browser windows.

This method takes a window descriptor as an argument:

```js
fixture `Example page`
    .page('http://example.com');

test('Switch to a specific window', async t => {
    const initialWindow = await t.getCurrentWindow();
    const window2 = await t.openWindow('http://devexpress.com');
    const window3 = await t.openWindow('http://github.com');

    await t.switchToWindow(initialWindow);

    const url = await t.eval(() => document.documentURI);
    await t.expect(url).eql('http://example.com/');
});
```

You can also pass [a predicate](../../reference/test-api/testcontroller/switchtowindow.md#tswitchtowindowpredicate) with a description of the window:

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

Use the [t.switchToPreviousWindow](../../reference/test-api/testcontroller/switchtopreviouswindow.md) method to switch to the previous window:

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

## Close an Existing Window

> You cannot close windows with open children.

Call the [t.closeWindow](../../reference/test-api/testcontroller/closewindow.md) method without parameters to close the active window:

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

Pass a window descriptor when you call the [t.closeWindow](../../reference/test-api/testcontroller/closewindow.md) method to close a specific window:

```js
test('Close a specific window', async t => {
    const window1 = await t.openWindow('http://devexpress.com');
    await t.closeWindow(window1);
});
```

## Disable Support for Multiple Windows

Use one of the following settings to disable support for multiple browser windows:

* the [--disable-multiple-windows](../../reference/command-line-interface.md#--disable-multiple-windows) command line flag,
* the `disableMultipleWindows` option of the [runner.run Method](../../reference/testcafe-api/runner/run.md),
* the [disableMultipleWindows](../../reference/configuration-file.md#disablemultiplewindows) configuration file property.

## Limitations

This section describes the limitations of multiple browser windows testing in TestCafe.

### Supported Browsers

TestCafe's multi-window mode supports the following browsers:

* Chrome (headless and headed)
* Firefox (headless and headed)

Multiple browser windows are not available in [cloud browsers](../basic-guides/run-tests.md#test-in-cloud-testing-services), [remote browsers](../basic-guides/run-tests.md#test-on-remote-and-mobile-devices) and during [Chromium mobile device emulation](../basic-guides/run-tests.md#enable-mobile-device-emulation).

Multiple browser windows are not available in browsers launched with a [custom browser provider plugin](../extend-testcafe/browser-provider-plugin.md). If you use actions that only work in the multiple browser windows mode (for example, [t.openWindow](../../reference/test-api/testcontroller/openwindow.md)) during tests in a custom browser, TestCafe stops test execution and throws an error.

### Recorded Video Aspect Ratio in Multiple Windows

When you launch TestCafe with [video recording](./screenshots-and-videos.md) enabled, the recording scales to the initial (parent) browser window.

When a child window opens, TestCafe continues recording in that window. If the child windows' size differs, the parts of the video that are recorded in these windows are resized to fit the aspect ratio of the main browser window. As a result, portions of the recording appear stretched.

### Cookies and User Roles Limitations in Child Windows

TestCafe's [User Roles](./authentication.md#user-roles) preserve browser storage contents (cookies, `localStorage` and `sessionStorage`). A [TestCafe instance](../../reference/testcafe-api/testcafe/README.md) can only have one active User Role at a time.

If you switch between roles in any browser window, cookies and local/session storage contents inside that role are applied to the remaining windows.
