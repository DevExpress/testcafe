---
layout: docs
title: Test.timeouts Method
permalink: /documentation/reference/test-api/test/timeouts.html
---
# Test.timeouts Method

Sets timeouts for the test.

```text
test.timeouts({
    [pageLoadTimeout]
    [, pageRequestTimeout]
    [, ajaxRequestTimeout]
}) → this
```

Parameter                         | Type   | Description
--------------------------------- | ------ | ---------------------------------------------------------------------------
`pageLoadTimeout` *(optional)*    | number | The time (in milliseconds) passed after the `DOMContentLoaded` event, within which TestCafe waits for the `window.load` event to fire. See [pageLoadTimeout](../../configuration-file.md#pageloadtimeout).
`pageRequestTimeout` *(optional)* | number | The time (in milliseconds) to wait for HTML pages. See [pageRequestTimeout](../../configuration-file.md#ajaxrequesttimeout).
`ajaxRequestTimeout` *(optional)* | number | Wait time (in milliseconds) for fetch/XHR requests. See [ajaxRequestTimeout](../../configuration-file.md#ajaxrequesttimeout).

```js
fixture `My Fixture`
    .timeouts({
        pageLoadTimeout:    2000,
        pageRequestTimeout: 60000,
        ajaxRequestTimeout: 60000
    })
    .page `http://devexpress.github.io/testcafe/example`;

test('My test' , async t => {
})
```
