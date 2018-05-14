---
layout: docs
title: Specifying Which Requests are Handled by the Hook
permalink: /documentation/test-api/intercepting-http-requests/specifying-which-requests-are-handled-by-the-hook.html
checked: false
---
# Specifying Which Requests are Handled by the Hook

The request logger, mock and custom request hooks require specifying which requests they should handle and skip.

You can set up this filtering by passing the *request filtering rules* to the hook. Note that you can pass a single rule or an array of rules.

* [Filtering by a URL](#filtering-by-a-url)
* [Filtering by a Regular Expression](#filtering-by-a-regular-expression)
* [Filtering by Request Parameters](#filtering-by-request-parameters)
* [Filtering by a Predicate](#filtering-by-a-predicate)

## Filtering by a URL

Pass a string with a URL to intercept all requests sent to this URL.

```js
const logger = RequestLogger('http://example.com');
```

```js
const mock = RequestMock()
    .onRequestTo('http://external-service.com/api/')
    .respond(/*...*/);
```

## Filtering by a Regular Expression

You can also specify a regular expression that matches the desired URLs.

```js
const logger = RequestLogger(/.co.uk/);
```

```js
const mock = RequestMock()
    .onRequestTo('/\/api\/users\//')
    .respond(/*...*/);
```

## Filtering by Request Parameters

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

## Filtering by a Predicate

You can get more request parameters using a predicate function and use them to determine whether to handle the request.

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
`userAgent` | String | The user agent that originated the request.
`url`       | String | The URL to which the request is sent.
`method`    | String | The request method.
`isAjax`    | Boolean | Specifies whether this is an AJAX request.
`headers`   | Object | The request headers in the property-value form.
`body`      | String | A stringified request body.
