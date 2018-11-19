---
layout: docs
title: Mocking HTTP Requests
permalink: /documentation/test-api/intercepting-http-requests/mocking-http-requests.html
redirect_from:
  - /documentation/test-api/intercepting-http-requests/mocking-http-responses.html
---
# Mocking HTTP Requests

Mocking is useful when the tested app uses infrastructure that is difficult to deploy during the test run. In this instance, you can intercept requests to this resource and mock them using TestCafe.

* [Creating a Mocker](#creating-a-mocker)
* [The onRequestTo Method](#the-onrequestto-method)
* [The respond Method](#the-respond-method)
  * [A Custom Response Function](#a-custom-response-function)
* [Examples](#examples)
  * [Mocking Cross-Domain Requests](#mocking-cross-domain-requests)

## Creating a Mocker

To create a request mocker, use the `RequestMock` constructor.

```js
var mock = RequestMock()
```

Then call the `onRequestTo` and `respond` methods in a chain. The `onRequestTo` method specifies a request to intercept, while the `respond` method specifies the mocked response for this request. Repeat calling these methods to provide a mock for every request you need.

```js
var mock = RequestMock()
    .onRequestTo(request1)
    .respond(responseMock1)
    .onRequestTo(request2)
    .respond(responseMock2);
```

Next, [attach it to a test or fixture](attaching-hooks-to-tests-and-fixtures.md).

## The onRequestTo Method

```text
onRequestTo(filter)
```

Parameters | Type | Description | Default
---------- | ---- | ----------- | -----
`filter`&#160;*(required)* | String &#124; RegExp &#124; Object &#124; Predicate | Specifies which requests should be mocked with a response that follows in the `respond` method. See [Specifying Which Requests are Handled by the Hook](specifying-which-requests-are-handled-by-the-hook.md). | All requests are mocked.

```js
var mock = RequestMock()
    .onRequestTo('http://external-service.com/api/')
    .respond(/*...*/)
    .onRequestTo(/\/users\//)
    .respond(/*...*/);
```

## The respond Method

```text
respond([body] [, statusCode] [, headers])
```

Parameter | Type | Description   | Default
--------- | ---- | ------------- | -----
`body`&#160;*(optional)* | Object &#124; String &#124; Function &#124; [Buffer](https://nodejs.org/api/buffer.html) | A mocked response body. Pass an object for a JSON response, a string for an HTML response or a function to build a custom response. | An empty HTML page is returned with the response.
`statusCode`&#160;*(optional)* | Number | The response status code. | `200`
`headers`&#160;*(optional)* | Object | Custom headers added to the response in the property-value form.| The `content-type` header. If the header is not provided, it is set depending on the `body` parameter's type. If `body` is an object, the `content-type` header is set to *application/json*. If `body` has another type, the `content-type` header is set to *text/html; charset=utf-8*.

```js
var mock = RequestMock()
    .onRequestTo(/*...*/)
    .respond({ data: 123 }) // a JSON response
    .onRequestTo(/*...*/)
    .respond('<html></html>') // an HTML response
    .onRequestTo(/*...*/)
    .respond(null, 204) // an empty response with a status code
    .onRequestTo(/*...*/)
    .respond('<html_markup>', 200, { // a response with custom headers
        'server': 'nginx/1.10.3'
    })
    .onRequestTo(/*...*/)
    .respond(Buffer.from([0x62, 0x75, 0x66, 0x66, 0x65, 0x72])) // a response with binary data
    .onRequestTo(/*...*/)
    .respond((req, res) => { // a custom response
        res.headers['x-calculated-header'] = 'calculated-value';
        res.statusCode = '200';

        const parsedUrl = url.parse(req.path, true);

        res.setBody('calculated body' + parsedUrl.query['param']);
    });
```

### A Custom Response Function

```js
var mock = RequestMock()
    .onRequestTo(/*...*/)
    .respond((req, res) => {
        // ...
    });
```

A custom response function takes two parameters.

Parameter | Type | Description
--------- | ---- | ---------------
`req`     | [RequestOptions](requestoptions-object.md) | A request to be mocked.
`res`     | Object | A mocked response.

Use information about the request the `req` parameter provides to configure the response via the `res` parameter.

The `res` exposes the following members:

Property | Type | Description
-------- | ---- | ------------
`headers` | Object | The response headers.
`statusCode` | Number | The response status code.

Method | Description
------ | ---------------
`setBody(value)` | Sets the response body. Accepts a string as a parameter.

## Examples

### Mocking Cross-Domain Requests

When you mock a cross-domain request, specify the allowed origin in the response's [access-control-allow-origin](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin) header to pass [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) validation.

If you specify the [access-control-allow-credentials](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Credentials) header in the response, provide the tested site's domain in the `access-control-allow-origin` header.

```js
fixture `My Fixture`
    .page `https://my.domain/tested/page/`

const mock = RequestMock()
    .onRequestTo('https://different.domain/api/method/')
    .respond({ data: 123 }, 500, {
        'access-control-allow-credentials': true,
        'access-control-allow-origin': 'https://my.domain'
    });
```

In case you do not enable `access-control-allow-credentials`, you can also pass an asterisk `*` as the `access-control-allow-origin` value to indicate that cross-origin requests are permitted from any domain.

```js
    .respond({ data: 123 }, 500, { 'access-control-allow-origin': '*' });
```