---
layout: docs
title: Logging HTTP Requests
permalink: /documentation/test-api/intercepting-http-requests/logging-http-requests.html
checked: true
---
# Logging HTTP Requests

You can use the `RequestLogger` to log HTTP requests sent during test execution. This object stores all requests sent and responses received while the test is running.

* [Creating a Logger](#creating-a-logger)
* [Logger Methods](#logger-methods)
* [Logger Properties](#logger-properties)
* [The Request Object](#the-request-object)

## Creating a Logger

Use the `RequestLogger` constructor to create a request logger.

```text
RequestLogger([filter] [, options])
```

Parameter    | Type | Description | Default
------------ | ---- | ----------- | --------
`filter`&#160;*(optional)*  | String &#124; RegExp &#124; Object &#124; Predicate &#124; Array | Specifies which requests the logger should track. See [Select Requests to be Handled by the Hook](select-requests-to-be-handled-by-the-hook.md). | All requests are tracked
`options`&#160;*(optional)* | Object | Options that define how the requests and responses are logged. | See below

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

To enable the logger to track the requests, [attach it to a test or fixture](attaching-hooks-to-tests-and-fixtures.md).

The `RequestLogger` stores the following parameters by default:

* The URL where the request is sent.
* The request's HTTP method.
* The status code received in the response.
* The user agent that sent the request.

Use the logger's API to access the data it stores.

## Logger Methods

Method | Return Type | Description
------ | ----------- | -------------
`contains(predicate)` | Promise | Returns whether the logger contains a request that matches the predicate.
`count(predicate)`    | Promise | Returns the number of requests that match the predicate.
`clear()`             | None    | Clears all logged requests.

The `predicate` functions take a single parameter - the `Request` object.

If you use the `contains(predicate)` or `count(predicate)` methods in assertions, TestCafe uses the [Smart Assertion Query Mechanism](../assertions/README.md#smart-assertion-query-mechanism).

## Logger Properties

Property | Type | Description
-------- | ---- | -----------
`requests` | Array of Request | Returns an array of logged requests.

## The Request Object

This object represents a request-response pair.

Property | Type | Description
-------- | ---- | -----------
`userAgent`  | String | The user agent that sent the request.
`request.url`    | String | The URL where the request is sent.
`request.method`     | String | The request's HTTP method.
`request.headers`    | Object | Request headers in the property-value form. Logged if the `logRequestHeaders` option is set to `true`.
`request.body`    | [Buffer](https://nodejs.org/api/buffer.html) &#124; String | The request body. A [Buffer](https://nodejs.org/api/buffer.html) or string depending on the `stringifyRequestBody` option. Logged if the `logRequestBody` option is set to `true`.
`response.statusCode` | Number | The status code received in the response.
`response.headers`    | Object | Response headers in the property-value form. Logged if the `logResponseHeaders` option is set to `true`.
`response.body`    | [Buffer](https://nodejs.org/api/buffer.html) &#124; String | The response body. A [Buffer](https://nodejs.org/api/buffer.html) or string depending on the `stringifyResponseBody` option. Logged if the `logResponseBody` option is set to `true`.

**Example**

```js
import { RequestLogger } from 'testcafe';

const logger = RequestLogger('http://example.com');

fixture `test`
    .page('http://example.com');

test
    .requestHooks(logger)
    ('test', async t => {

        // Ensure that the response has been received and that its status code is 200.
        await t.expect(logger.contains(record => record.response.statusCode === 200)).ok();

        const logRecord = logger.requests[0];

        console.log(logRecord.userAgent);           // Chrome 63.0.3239 / Windows 8.1.0.0
        console.log(logRecord.request.url);         // http://api.example.com
        console.log(logRecord.request.method);      // get
        console.log(logRecord.response.statusCode); // 304
    });
```