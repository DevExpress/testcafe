---
layout: docs
title: t.getCurrentWindow Method
permalink: /documentation/reference/test-api/testcontroller/getcurrentwindow.html
---

# t.getCurrentWindow method

Retrieves a window descriptor that corresponds to the active window.

```js
t.getCurrentWindow();
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
