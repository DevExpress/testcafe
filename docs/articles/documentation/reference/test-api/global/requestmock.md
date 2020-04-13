---
layout: docs
title: RequestMock Constructor
permalink: /documentation/reference/test-api/global/requestmock.html
---
# RequestMock Constructor

Creates a [request mocker](../requestmock/README.md).

```text
RequestMock()
```

Use the [requestMock.onRequestTo](../requestmock/onrequestto.md) method followed by [respond](../requestmock/respond.md) to define which request should be mocked and specify the responses. Then, [attach the mock](../../../guides/advanced-guides/intercept-http-requests.md#attach-hooks-to-tests-and-fixtures) to a test or fixture.

```js
var mock = RequestMock()
    .onRequestTo(/google.com/)
    .respond('', 404);

fixture `My Fixture`
    .requestHooks(mock);

test('My test', async t => {
    /* ... */
});
```
