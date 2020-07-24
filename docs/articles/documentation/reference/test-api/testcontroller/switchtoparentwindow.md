---
layout: docs
title: t.switchToParentWindow Method
permalink: /documentation/reference/test-api/testcontroller/switchtoparentwindow.html
---

# t.switchToParentWindow method

Switches to the window that opened the currently active window.

```JavaScript
t.switchToParentWindow()
```

### Example

```JavaScript
import { Selector, ClientFunction } from 'testcafe';

fixture `Example page`
    .page('http://www.example.com/');

test('Switch to a parent window', async t => {
    await t
        .openWindow('https://devexpress.com')
        .switchToParentWindow();
        
    const url = await t.eval(() => document.documentURI);
    await t.expect(url).eql('http://example.com/');
});
```
