---
layout: docs
title: RequestMock Class
permalink: /documentation/reference/test-api/requestmock/
---
# RequestMock Class

A request mocker that intercepts requests to a web resource and emulates the response.

Use the [RequestMock](../requestmock/constructor.md) constructor to create a mocker.

Call the [onRequestTo](onrequestto.md) and [respond](respond.md) methods in a chain to specify mock responses for every handled request.

To use the mocker during tests, [attach it to a test or fixture](../../../guides/advanced-guides/intercept-http-requests.md#attach-hooks-to-tests-and-fixtures).

```js
import { RequestMock } from 'testcafe';

var mock = RequestMock()
    .onRequestTo('https://api.mycorp.com/users/id/135865')
    .respond({
        name: 'John Hearts',
        position: 'CTO'
    })
    .onRequestTo(/internal.mycorp.com/)
    .respond(null, 404);

fixture `My fixture`
    .page `https://mycorp.com`
    .requestHooks(mock);

test('My test', async t => { /* ... */ });
```
