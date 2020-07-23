---
layout: docs
title: t.openWindow Method
permalink: /documentation/reference/test-api/testcontroller/openwindow.html
---

# t.openWindow method

Opens a new browser window.

Parameter | Type | Description
--------- | ---- | ------------
url | String | The URL to open. Absolute or relative to the current page.

The following example shows how to use the t.openWindow action.

```JavaScript
fixture `My fixture`
    .page `http://www.example.com/`;

test('Open the TestCafe website', async t => {
    await t
        .openWindow('http://devexpress.github.io/testcafe')
        .openWindow('file://path/to/my/website');
});
```

Use relative paths:

```JavaScript
fixture `TestCafe`
    .page `http://devexpress.github.io/testcafe`;

test('Open the documentation in a new window', async t => {
    await t
        .openWindow('./documentation');
});
```

