---
layout: docs
title: RequestMock.onRequestTo().respond Method
permalink: /documentation/reference/test-api/requestmock/respond.html
---
# RequestMock.onRequestTo().respond Method

Specifies the mock response.

```text
requestMock.onRequestTo().respond([body] [, statusCode] [, headers])
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

## A Custom Response Function

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
`req`     | [RequestOptions](#requestoptions) | A request to be mocked.
`res`     | Object | A mocked response.

Use information provided by the `req` parameter about the request to configure the response using the `res` parameter.

The `res` exposes the following members:

Property | Type | Description
-------- | ---- | ------------
`headers` | Object | The response headers.
`statusCode` | Number | The response status code.

Method | Description
------ | ---------------
`setBody(value)` | Sets the response body. Accepts a string as a parameter.

The response function can be synchronous or asynchronous:

```js
var mock = RequestMock()
   .onRequestTo(/*...*/)
   .respond((req, res) => {
        res.setBody('<html><body><h1>This is a page</h1></body></html>');
    })
    .onRequestTo(/*...*/)
    .respond(async (req, res) => {
        const body = await fetch('https://web-site.com/route/data');
        res.setBody(body);
    });
```

### RequestOptions

{% include intercept-http-requests/requestoptions-object.md %}
