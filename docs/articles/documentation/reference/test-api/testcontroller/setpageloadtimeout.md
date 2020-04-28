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

> Note that browsers raise the `DOMContentLoaded` event after they load and parse the HTML document, while `window.load` is raised after the browser loads all stylesheets, images and subframes. This is why `window.load` fires after the `DOMContentLoaded` event with a certain delay.
