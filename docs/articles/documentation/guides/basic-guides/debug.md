---
layout: docs
title: Debug
permalink: /documentation/guides/basic-guides/debug.html
---
# Debug

## Set the Test Speed

TestCafe allows you to specify the test execution speed.

Tests are run at the maximum speed by default. You can use the [t.setTestSpeed](../../reference/test-api/testcontroller/settestspeed.md) method to specify the speed.

```js
import { Selector } from 'testcafe';

fixture `Test Speed`
    .page `http://devexpress.github.io/testcafe/example/`;

const nameInput = Selector('#developer-name');

test(`Test Speed`, async t => {
    await t
        .typeText(nameInput, 'Peter')
        .setTestSpeed(0.1)
        .typeText(nameInput, ' Parker');
});
```

## Set Page Load Timeout

The page load timeout defines the time passed after the `DOMContentLoaded` event within which the `window.load` event should be raised.

After the timeout passes or the `window.load` event is raised (whichever happens first), TestCafe starts the test.

To specify the page load timeout in test code, use the [t.setPageLoadTimeout](../../reference/test-api/testcontroller/setpageloadtimeout.md) method.

```js
fixture `Page load timeout`
    .page `http://devexpress.github.io/testcafe/example/`;

test(`Page load timeout`, async t => {
    await t
        .setPageLoadTimeout(0)
        .navigateTo('http://devexpress.github.io/testcafe/');
});
```

You can also set the page load timeout when launching tests via the [command line](../using-testcafe/command-line-interface.md#--page-load-timeout-ms) or [API](../using-testcafe/programming-interface/runner.md#run).
