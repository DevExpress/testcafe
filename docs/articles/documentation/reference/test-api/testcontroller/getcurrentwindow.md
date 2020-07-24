---
layout: docs
title: t.getCurrentWindow Method
permalink: /documentation/reference/test-api/testcontroller/getcurrentwindow.html
---

# t.getCurrentWindow method

Retrieves the `window` object that contains information about the currently open window.

```JavaScript
t.getCurrentWindow();
```

## Example

```JavaScript
import { Selector } from 'testcafe';

fixture `Example page`
    .page('http://www.example.com/');

test('getCurrentWindow', async t => {
    await t.openWindow('https://devexpress.com');
    const devexpress = await t.getCurrentWindow();
    await t.closeWindow(devexpress);
});
```
