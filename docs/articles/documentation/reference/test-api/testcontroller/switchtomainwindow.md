---
layout: docs
title: t.switchToMainWindow Method
permalink: /documentation/reference/test-api/testcontroller/switchtomainwindow.html
---
# t.switchToMainWindow Action

Switches the test's browsing context from an `<iframe>` back to the main window.

```text
t.switchToMainWindow()
```

The example below demonstrates how to use `t.switchToMainWindow` action.

```js
fixture `My fixture`
    .page `http://www.example.com/`;

test('switching back to main window', async t => {
    await t
        .switchToIframe('#iframe-1')
        .click('#button-in-iframe-1')
        .switchToMainWindow()
        .click('#button-in-main-window');
});
```

You can switch from the main window to a specified `<iframe>` with the [t.switchToIframe](switchtoiframe.md) method.
