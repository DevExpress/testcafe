---
layout: docs
title: t.openWindow Method
permalink: /documentation/reference/test-api/testcontroller/openwindow.html
---

# t.openWindow method

Opens a new browser window. Returns the matching window descriptor and can be chained with other TestController methods.

```js
t.openWindow( url ) → Object
```

Parameter | Type | Description
--------- | ---- | ------------
url | String | The URL to open. Can be absolute or relative.

**Example:**

```js
import { Selector } from 'testcafe';

fixture `Example page`
    .page `http://www.example.com/`;

test('Open the TestCafe website', async t => {
    await t
        .openWindow('http://devexpress.github.io/testcafe')
        .openWindow('./documentation');
});
```
