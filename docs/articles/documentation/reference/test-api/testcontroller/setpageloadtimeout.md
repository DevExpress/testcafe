---
layout: docs
title: t.setPageLoadTimeout Method
permalink: /documentation/reference/test-api/testcontroller/setpageloadtimeout.html
---
# t.setPageLoadTimeout Method

Defines the time passed after the `DOMContentLoaded` event within which the `window.load` event should be raised.

```text
t.setPageLoadTimeout( duration )
```

Parameter  | Type      | Description
---------- | --------- | -----------
`duration` | Number    | Page load timeout (in milliseconds). `0` to skip waiting for the `window.load` event.

After the timeout passes or the `window.load` event is raised (whichever happens first), TestCafe starts the test.

You can also set the page load timeout when you launch tests from the [command line](../../command-line-interface.md#--page-load-timeout-ms) or [API](../../programming-interface/runner.md#run).

**Example**

```js
fixture `Page load timeout`
    .page `http://devexpress.github.io/testcafe/example/`;

test(`Page load timeout`, async t => {
    await t
        .setPageLoadTimeout(0)
        .navigateTo('http://devexpress.github.io/testcafe/');
});
```

> Note that the `DOMContentLoaded` event is raised after the HTML document is loaded and parsed, while `window.load` is raised after all stylesheets, images and subframes are loaded. That is why `window.load` is fired after the `DOMContentLoaded` event with a certain delay.
