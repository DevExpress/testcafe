---
layout: docs
title: t.maximizeWindow Method
permalink: /documentation/reference/test-api/testcontroller/maximizewindow.html
---
# t.maximizeWindow Method

Maximizes the browser window.

```text
t.maximizeWindow( )
```

The following example shows how to use the `t.maximizeWindow` action.

```js
import { Selector } from 'testcafe';

const menu = Selector('#side-menu');

fixture `My fixture`
    .page `http://www.example.com/`;

test('Side menu is displayed in full screen', async t => {
    await t
        .maximizeWindow()
        .expect(menu.visible).ok();
});
```
