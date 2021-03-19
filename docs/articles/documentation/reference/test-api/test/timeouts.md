---
layout: docs
title: Test.timeouts Method
permalink: /documentation/reference/test-api/test/timeouts.html
---
# Test.timeouts Method

Customize timeout values for requests performed during a test.

```text
test.timeouts({
    [pageLoadTimeout]
    [, pageRequestTimeout]
    [, ajaxRequestTimeout]
}) → this
```

Parameter                         | Type   | Description
--------------------------------- | ------ | ---------------------------------------------------------------------------
`pageLoadTimeout` *(optional)*    | number | Maximum time (in milliseconds) between the`DOMContentLoaded` event and the `window.load` event. See [pageLoadTimeout](../../configuration-file.md#pageloadtimeout).
`pageRequestTimeout` *(optional)* | number | Maximum time (in milliseconds) for the web server to serve an HTML page. See [pageRequestTimeout](../../configuration-file.md#ajaxrequesttimeout).
`ajaxRequestTimeout` *(optional)* | number | Maximum time (in milliseconds) between a fetch/XHR request and the response. See [ajaxRequestTimeout](../../configuration-file.md#ajaxrequesttimeout).

```js
fixture`My Fixture`
    .page`http://devexpress.github.io/testcafe/example`;

test
    .timeouts({
        pageLoadTimeout:    2000,
        pageRequestTimeout: 60000,
        ajaxRequestTimeout: 60000
    })
    ('My test', async t => {
        //test actions
    })
```
