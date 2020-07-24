---
layout: docs
title: t.switchToWindow Method
permalink: /documentation/reference/test-api/testcontroller/switchtowindow.html
---

# t.switchToWindow method

Switches to a specific browser window.

## t.switchToWindow(window)

Activates the window described by the window object.

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
`dependencies` | Object   | Variables and objects passed to the `filterFn` function.

The `filterFn` predicate is executed on the client side and accepts the following parameters:

Parameter | Description
------ | -----
`url`  | Object describing the URL of the window you're looking for.
`title` | The title of the window you're looking for.

The `url` object can contain the following properties:

Property | Description | Example
------ | ----- | -----
`protocol`  | Protocol used | `'https:`
`port`  | Port number | `'80'`
`host`  | Hostname | `'www.devexpress.com'`
`pathname` | Location relative to the host's root folder | `'/products/testcafestudio/'`
`href`|  The complete URL | `'https://www.devexpress.com/products/testcafestudio/'`

### Example

```JavaScript
import { Selector } from 'testcafe';

fixture `Example page`
    .page('http://www.example.com/');

test('Switching between different windows', async t => {
    await t.openWindow('https://devexpress.github.io/testcafe')
        .openWindow('https://devexpress.com')
        .switchToWindow(w => w.url.host === "devexpress.github.io")
        .switchToWindow(w => w.title === "Example Domain" && w.url.host === "www.example.com");
});
```
