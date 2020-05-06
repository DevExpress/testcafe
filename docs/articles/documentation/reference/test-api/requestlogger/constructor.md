---
layout: docs
title: RequestLogger Constructor
permalink: /documentation/reference/test-api/requestlogger/constructor.html
---
# RequestLogger Constructor

Creates a [request logger](README.md).

```text
RequestLogger([filter] [, options])
```

Parameter    | Type | Description | Default
------------ | ---- | ----------- | --------
`filter`&#160;*(optional)*  | String &#124; RegExp &#124; Object &#124; Predicate &#124; Array | Specifies which requests the logger should track. See [Select Requests to be Handled by the Hook](#select-requests-to-be-handled-by-the-hook). | All requests are tracked
`options`&#160;*(optional)* | Object | Options that define how requests and responses are logged. | See below

The `options` parameter contains the following options:

Option | Type | Description   | Default
------ | ---- | ------------- | ---------
`logRequestHeaders` | Boolean | Specifies whether the request headers should be logged. | `false`
`logRequestBody` | Boolean | Specifies whether the request body should be logged. | `false`
`stringifyRequestBody` | Boolean | Specifies whether the request body should be stored as a String or a [Buffer](https://nodejs.org/api/buffer.html). When you set `stringifyRequestBody` to `true`, make sure that the request body is logged (`logRequestBody` is also `true`). Otherwise, an error is thrown. | `false`
`logResponseHeaders` | Boolean | Specifies whether the response headers should be logged. | `false`
`logResponseBody` | Boolean | Specifies whether the response body should be logged. | `false`
`stringifyResponseBody` | Boolean | Specifies whether the response body should be stored as a string or a [Buffer](https://nodejs.org/api/buffer.html). When you set `stringifyResponseBody` to `true`, make sure that the response body is logged (`logResponseBody` is also `true`). Otherwise, an error is thrown. | `false`

```js
import { RequestLogger } from 'testcafe';

const simpleLogger = RequestLogger('http://example.com');
const headerLogger = RequestLogger(/testcafe/, {
    logRequestHeaders: true,
    logResponseHeaders: true
});
```

{% include intercept-http-requests/request-filter.md %}
