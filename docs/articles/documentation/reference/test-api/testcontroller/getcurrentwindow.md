---
layout: docs
title: t.getCurrentWindow Method
permalink: /documentation/reference/test-api/testcontroller/getcurrentwindow.html
---

# t.getCurrentWindow Method

Retrieves a window descriptor that corresponds to the active window. Can be chained with other `TestController` methods.

```text
t.getCurrentWindow() → this | Promise<unknown>
```

## Example

```js
import { Selector } from 'testcafe';

fixture `Example page`
    .page('http://www.example.com/');

test('getCurrentWindow', async t => {
    await t.openWindow('https://devexpress.com');
    const devexpress = await t.getCurrentWindow();
    await t.closeWindow(devexpress);
});
```
