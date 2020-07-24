---
layout: docs
title: t.openWindow Method
permalink: /documentation/reference/test-api/testcontroller/openwindow.html
---

# t.openWindow method

Opens a new browser window.

Parameter | Type | Description
--------- | ---- | ------------
url | String | The URL to open. Can be local or remote, absolute or relative.

**Example:**

```JavaScript
import { Selector } from 'testcafe';

fixture `Example page`
    .page `http://www.example.com/`;

test('Open the TestCafe website', async t => {
    await t
        .openWindow('http://devexpress.github.io/testcafe')
        .openWindow('./documentation')
        .openWindow('file://path/to/my/website');
});
```
