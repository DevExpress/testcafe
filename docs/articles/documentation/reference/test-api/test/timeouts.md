---
layout: docs
title: Test.timeouts Method
permalink: /documentation/reference/test-api/test/timeouts.html
---
# Test.timeouts Method

Customize timeout values for the requests performed during a particular test.

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
`pageRequestTimeout` *(optional)* | number | The time (in milliseconds) to wait for HTML pages. See [pageRequestTimeout](../../configuration-file.md#ajaxrequesttimeout).
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
