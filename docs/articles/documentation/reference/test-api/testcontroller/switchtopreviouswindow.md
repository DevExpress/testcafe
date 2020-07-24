---
layout: docs
title: t.switchToPreviousWindow Method
permalink: /documentation/reference/test-api/testcontroller/switchtopreviouswindow.html
---

# t.switchToPreviousWindow Method

Switches to the previously open window.

```JavaScript
t.switchToParentWindow()
```

### Example

```JavaScript
import { Selector, ClientFunction } from 'testcafe';

fixture `Example page`
    .page('http://www.example.com/');

test('Switch to the previous window', async t => {
    await t
        .openWindow('https://devexpress.com')
        .switchToPreviousWindow();
        
    const url = await t.eval(() => document.documentURI);
    await t.expect(url).eql('http://example.com/');
});
```
