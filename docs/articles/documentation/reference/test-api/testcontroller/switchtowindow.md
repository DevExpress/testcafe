---
layout: docs
title: t.switchToWindow Method
permalink: /documentation/reference/test-api/testcontroller/switchtowindow.html
---

# t.switchToWindow method

Switches to a specific browser window.

## t.switchToWindow(window)

Activates the window represented by the window object.

```JavaScript
t.SwitchToWindow(window);
```

### Example

```JavaScript
Import { Selector } from 'testcafe';

fixture `TestCafe`
    .page('https://devexpress.github.io/testcafe/');

test('Switch to a different window', async t => {
    const homepage = await t.getCurrentWindow();
    const documentation = await t.openWindow('http://devexpress.github.io/testcafe/documentation');
    await t.switchToWindow(homepage)
        .switchToWindow(documentation);
});
```

## t.switchToWindow(predicate)

Activates the first window that matches the criteria passed to the `filterFn` function

```JavaScript
t.SwitchToWindow(filterFn, dependencies);
```

Argument                         | Type     | Description
-------------------------------- | -------- | --------------
`filterFn`                       | Function | The predicate used to filter windows.
`dependencies`&#160;*(optional)* | Object   | Variables and objects passed to the `filterFn` function.

The `filterFn` predicate is executed on the client side and accepts the following parameters:

Parameter | Description
------ | -----
`url`  | Object describing the URL of a currently displayed web page.
`title` | The title of a currently displayed web page.

{% include multiwindow/url-object.md %}
