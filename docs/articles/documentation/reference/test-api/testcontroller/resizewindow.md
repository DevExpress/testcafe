---
layout: docs
title: t.resizeWindow Method
permalink: /documentation/reference/test-api/testcontroller/resizewindow.html
---
## t.resizeWindow Method

Resizes a window to fit the parameters entered by user.

```text
t.resizeWindow( width, height )
```

Parameter  | Type    | Description
---------- | ------- | --------------------------
`width`    | Number  | The new width, in pixels.
`height`   | Number  | The new height, in pixels.

The following example demonstrates how to use the `t.resizeWindow` action.

```js
import { Selector } from 'testcafe';

const menu = Selector('#side-menu');

fixture `My fixture`
    .page `http://www.example.com/`;

test('Side menu disappears on small screens', async t => {
    await t
        .resizeWindow(200, 100)
        .expect(menu.getStyleProperty('display')).eql('none');
});
```

You can also resize window to fit a specified type of device with [t.resizeWindowToFitDevice](resizewindowtofitdevice.md) method and maximize window with [t.maximizeWindow](maximizewindow.md).
