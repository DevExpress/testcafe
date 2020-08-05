---
layout: docs
title: t.switchToParentWindow Method
permalink: /documentation/reference/test-api/testcontroller/switchtoparentwindow.html
---

# t.switchToParentWindow method

Activates the window that launched or was active during the launch of the active window.

```js
t.switchToParentWindow()
```

**Example:**

```js
import { Selector, ClientFunction } from 'testcafe';

fixture `Example page`
    .page('http://www.example.com/');

test('Switch to the parent window', async t => {
    await t
        .openWindow('https://devexpress.com')
        .switchToParentWindow();

    const url = await t.eval(() => document.documentURI);
    await t.expect(url).eql('http://example.com/');
});
```
