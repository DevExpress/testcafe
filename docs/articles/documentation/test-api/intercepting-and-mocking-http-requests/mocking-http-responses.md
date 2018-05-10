---
layout: docs
title: Mocking HTTP Responses
permalink: /documentation/test-api/intercepting-and-mocking-http-requests/mocking-http-responses.html
checked: false
---
# Mocking HTTP Responses

Mocking is useful when the tested app uses infrastructure that is difficult to deploy during the test run. In this instance, you can intercept requests to this resource and mock the responses using TestCafe.

* [Creating a Mocker](#creating-a-mocker)
* [The onRequestTo Method](#the-onrequestto-method)
* [The respond Method](#the-respond-method)
  * [A Custom Response Function](#a-custom-response-function)

## Creating a Mocker

To create a response mocker, use the `RequestMock` constructor.

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

To enable the hook to mock the requests, [attach it to a test or fixture](attaching-hooks-to-tests-and-fixtures.md).

## The onRequestTo Method

```text
onRequestTo([filter])
```

Parameters | Type | Description | Default
---------- | ---- | ----------- | -----
`filter`&#160;*(optional)* | String &#124; RegExp &#124; Object &#124; Predicate | Specifies which requests should be mocked with a response that follows in the `respond` method. See [Specifying Which Requests are Handled by the Hook](specifying-which-requests-are-handled-by-the-hook.md). | All requests are mocked.

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
`body`&#160;*(optional)* | Object &#124; String &#124; Function | A mocked response body. Pass an object for a JSON response, a string for an HTML response or a function to build a custom response. | An empty HTML page is returned with the response.
`statusCode`&#160;*(optional)* | Number | The response status code. | `200`
`headers`&#160;*(optional)* | Object | Custom headers added to the response in the property-value form.| The `content-type` header is provided.

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
`req`     | Object | A request to be mocked.
`res`     | Object | A mocked response.

Use information about the request the `req` parameter provides to configure the response via the `res` parameter.

The `req` parameter exposes the following members:

Property | Type | Description
-------- | ---- | ------------
`headers`     | Object  | The request headers in the property-value form.
`body`        | [Buffer](https://nodejs.org/api/buffer.html) | The request body.
`url`    | String | A URL to which the request is sent.
`protocol` | String | The request protocol.
`hostname` | String | The destination host name.
`host`     | String | The destination host.
`port`     | Number | The destination port.
`path`     | String | The destination path.
`method`   | String | The request method.
`credentials` | Object | Credentials that were used to authenticate in the current session using NTLM or Basic authentication. For HTTP Basic authentication, these are `username` and `password`. NTLM authentication additionally specifies `workstation` and `domain`.
`proxy`       | Object | If a proxy is used, contains information about its `host`, `hostname`, `port`, `proxyAuth`, `authHeader` and `bypassRules`.

Use the following members `res` exposes to configure the response:

Property | Type | Description
-------- | ---- | ------------
`headers` | Object | The response headers.
`statusCode` | Number | The response status code.

Method | Description
------ | ---------------
`setBody(value)` | Sets the `value` as the response body.
