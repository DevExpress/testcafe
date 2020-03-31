The `Request` object represents a request-response pair.

```js
{
    userAgent: String,
    request: {
        url: String,
        method: String,
        headers: Object,
        body: Buffer | String,
        timestamp: Number
    },
    response: {
        statusCode: Number,
        headers: Object,
        body: Buffer | String,
        timestamp: Number
    }
}
```

Property | Type | Description
-------- | ---- | -----------
`userAgent`  | String | Identifies the user agent that sent the request. Contains the formatted name and version of the browser and operating system.
`request.url`    | String | The URL where the request is sent.
`request.method`     | String | The request's HTTP method.
`request.headers`    | Object | Request headers in the property-value form. Logged if the `logRequestHeaders` option is set to `true`.
`request.body`    | [Buffer](https://nodejs.org/api/buffer.html) &#124; String | The request body. A [Buffer](https://nodejs.org/api/buffer.html) or string depending on the `stringifyRequestBody` option. Logged if the `logRequestBody` option is set to `true`.
`request.timestamp` | Number | The timestamp that specifies when the request was intercepted.
`response.statusCode` | Number | The status code received in the response.
`response.headers`    | Object | Response headers in the property-value form. Logged if the `logResponseHeaders` option is set to `true`.
`response.body`    | [Buffer](https://nodejs.org/api/buffer.html) &#124; String | The response body. A [Buffer](https://nodejs.org/api/buffer.html) or string depending on the `stringifyResponseBody` option. Logged if the `logResponseBody` option is set to `true`.
`response.timestamp` | Number | The timestamp that specifies when the response was intercepted.