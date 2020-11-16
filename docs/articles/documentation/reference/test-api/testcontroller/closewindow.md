---
layout: docs
title: t.closeWindow Method
permalink: /documentation/reference/test-api/testcontroller/closewindow.html
---

# t.closeWindow method

Closes a browser window. Can be chained with other `TestController` methods.

```text
t.closeWindow([windowDescriptor]) → this | Promise<any>
```

Parameter | Type | Description
--------- | ---- | ------------
windowDescriptor *(optional)* | Object | Object that describes the target window. If this parameter is omitted, the active window is selected.

>You cannot close the last remaining window or windows with open children.

**Examples:**

The following two examples produce identical test scenarios:

The `window` parameter is absent. Each call of the `t.closeWindow` method closes the active window:

```js
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

The `window` parameter is present. Each call of the `t.closeWindow` method closes the specified target window:

```js
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
