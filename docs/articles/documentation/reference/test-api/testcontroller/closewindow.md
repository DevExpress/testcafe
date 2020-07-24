---
layout: docs
title: t.closeWindow Method
permalink: /documentation/reference/test-api/testcontroller/closewindow.html
---

# t.closeWindow method

Closes a browser window.

```JavaScript
t.closeWindow( [window] )
```

Parameter | Type | Description
--------- | ---- | ------------
window *(optional)* | Window | The window you want to close. If this parameter is omitted, the currently active window is selected.

> You can not close the last remaining window, or windows with open children.

**Examples:**

The following two examples should produce identical test scenarios.

Closing specific windows:

```JavaScript
import { Selector } from 'testcafe';

fixture `TestCafe`
    .page('http://www.example.com/');

test('Closing specific windows', async t => {
    const testcafe =  await t.openWindow('https://devexpress.github.io/testcafe');

    await t.openWindow('https://devexpress.com');
    const devexpress = await t.getCurrentWindow();

    await t.closeWindow(devexpress)
        .closeWindow(testcafe);
});
```

Calling the closeWindow() function without an argument:

```JavaScript
import { Selector } from 'testcafe';

fixture `TestCafe`
    .page('http://www.example.com/');

test('Closing windows', async t => {
    await t.openWindow('https://devexpress.github.io/testcafe');
        .openWindow('https://devexpress.com');
        .closeWindow()
        .closeWindow();
});
```
