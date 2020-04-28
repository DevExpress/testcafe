---
layout: docs
title: RequestMock.onRequestTo Method
permalink: /documentation/reference/test-api/requestmock/onrequestto.html
---
# RequestMock.onRequestTo Method

Specifies which requests should be mocked with a response that follows in the [respond](respond.md) method.

```text
requestMock.onRequestTo(filter)
```

Parameters | Type | Description | Default
---------- | ---- | ----------- | -----
`filter`&#160;*(required)* | String &#124; RegExp &#124; Object &#124; Predicate &#124; Array | Identifies the requests to mock. See [Select Requests to be Handled by the Hook](#select-requests-to-be-handled-by-the-hook). | All requests are mocked.

```js
var mock = RequestMock()
    .onRequestTo('http://external-service.com/api/')
    .respond(/*...*/)
    .onRequestTo(/\/users\//)
    .respond(/*...*/);
```

{% include intercept-http-requests/request-filter.md %}