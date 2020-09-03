---
layout: docs
title: t.switchToWindow Method
permalink: /documentation/reference/test-api/testcontroller/switchtowindow.html
---

# t.switchToWindow method

Switches to a specific browser window.

## t.switchToWindow(window)

Activates the window that corresponds to the window descriptor.

```js
t.switchToWindow(windowDescriptor);
```

Parameter | Type     | Description
-------------------------------- | -------- | --------------
`windowDescriptor` | Object | Descriptor object obtained from an open browser window.

**Example:**

```js
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

Activates the first window that matches the criteria passed to the `filterFn` function.

```js
t.switchToWindow(filterFn);
```

Parameter | Type     | Description
-------------------------------- | -------- | --------------
`filterFn` | Function | The predicate used to select windows.

The `filterFn` predicate accepts the following parameters:

Parameter | Type | Description
------ | ----- | -----
`url`  | Object |The URL
`title` | String | The window title

The `url` object has the same structure as [its Node.js counterpart](https://nodejs.org/api/url.html). It can contain the following properties:

Property | Description | Example
------ | ----- | -----
`protocol`  | Protocol used | `'https:'`
`host`  | Hostname | `'www.devexpress.com'`
`port`  | Port number | `'80'`
`pathname` | Location relative to the host's root folder | `'/products/testcafestudio/'`
`href`|  The complete URL | `'https://www.devexpress.com/products/testcafestudio/'`

**Example:**

```js
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
