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
window *(optional)* | Window | An open window object. If this parameter is omitted, the currently active window is closed.

> You can not close the last remaining window, or windows with open children.

## Examples

The following two examples should produce identical test scenarios.

Closing windows by passing the window object:

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

Closing the currently active window:

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
