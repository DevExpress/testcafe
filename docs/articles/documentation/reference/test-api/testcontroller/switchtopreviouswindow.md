---
layout: docs
title: t.switchToPreviousWindow Method
permalink: /documentation/reference/test-api/testcontroller/switchtopreviouswindow.html
---

# t.switchToPreviousWindow Method

Activates the most recent of the previously active windows.

```js
t.switchToPreviousWindow()
```

If no new windows are open or closed, consecutive method calls cycle between the two most recent windows.

## Example

```js
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
