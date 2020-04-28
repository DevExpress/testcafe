## Select Requests to be Handled by the Hook

### Filter by URL

#### Specify the Exact URL

Pass a string with a URL to intercept all requests sent to this exact URL.

```js
const logger = RequestLogger(['https://example.com', 'http://localhost:8080']);
```

```js
const mock = RequestMock()
    .onRequestTo('http://external-service.com/api/')
    .respond(/*...*/);
```

#### Use a Regular Expression to Specify the URL

You can also specify a regular expression that matches the desired URLs.

```js
const logger = RequestLogger(/.co.uk/);
```

```js
const mock = RequestMock()
    .onRequestTo(/\/api\/users\//)
    .respond(/*...*/);
```

### Filter by Parameters

You can filter requests by combining the URL and the request method.

In this instance, you need to use an object that contains the following fields:

Property | Type | Description
-------- | ---- | ------------
`url`    | String | A URL to which a request is sent.
`method` | String | The request method.
`isAjax` | Boolean | Specifies whether this is an AJAX request.

```js
const logger = RequestLogger({ url: 'http://example.com', method: 'GET', isAjax: false });
```

```js
const mock = RequestMock()
    .onRequestTo({ url: 'http://external-service.com/api/', method: 'POST', isAjax: true })
    .respond(/*...*/);
```

### Filter with a Predicate

You can get more request parameters and determine whether to handle the request with the predicate functions.

```js
const logger = RequestLogger(request => {
    return request.url === 'http://example.com' &&
           request.method === 'post' &&
           request.isAjax &&
           request.body === '{ test: true }' &&
           request.headers['content-type'] === 'application/json';
});
```

This predicate takes the `request` parameter that provides the following properties:

Property | Type | Description
-------- | ---- | --------------
`userAgent` | String | Identifies the user agent that originated the request. Contains the formatted name and version of the browser and operating system (`Firefox 69.0 / Windows 10.0.0`, `Chrome 77.0.3865.120 / macOS 10.15.1`).
`url`       | String | The URL to which the request is sent.
`method`    | String | The request method.
`isAjax`    | Boolean | Specifies whether this is an AJAX request.
`headers`   | Object | The request headers in the property-value form.
`body`      | String | A stringified request body.
