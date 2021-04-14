---
layout: docs
redirect_to: https://testcafe.io/documentation/402683/reference/test-api/testcontroller/setpageloadtimeout
title: t.setPageLoadTimeout Method
permalink: /documentation/reference/test-api/testcontroller/setpageloadtimeout.html
---
# t.setPageLoadTimeout Method

> Important! This method is **deprecated**. Use the [test.timeouts Method](../test/timeouts.md) to set the `pageLoadTimeout`.

Defines the time passed after the `DOMContentLoaded` event within which the `window.load` event should be raised. Can be chained with other `TestController` methods.

```text
t.setPageLoadTimeout(duration) → this | Promise<any>
```

Parameter  | Type      | Description
---------- | --------- | -----------
`duration` | Number    | Page load timeout (in milliseconds). `0` to skip waiting for the `window.load` event.

After the timeout passes or the `window.load` event is raised (whichever happens first), TestCafe starts the test.

You can also set the page load timeout when you launch tests from the [command line](../../command-line-interface.md#--page-load-timeout-ms) or [the API](../../testcafe-api/runner/run.md).

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

> The `DOMContentLoaded` event always precedes the `window.load` event. It fires when the browser has loaded and parsed the HTML content of the page. The `window.load` event, on the other hand, fires when the browser has loaded all the style sheets, images, and sub-frames.
