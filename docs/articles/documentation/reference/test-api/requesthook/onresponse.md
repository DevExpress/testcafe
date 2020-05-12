---
layout: docs
title: RequestHook.onResponse Method
permalink: /documentation/reference/test-api/requesthook/onresponse.html
---
# RequestHook.onResponse Method

Handles the response after it is received.

```js
class MyRequestHook extends RequestHook {
    async onResponse (event) {
        // ...
    }
}
```

The `onResponse` method's `event` object exposes the following properties:

Property | Type | Description
-------- | ---- | --------------
`event.statusCode` | Number | The response status code.
`event.headers`    | Object | The response headers in a property-value form.
`event.body`       | [Buffer](https://nodejs.org/api/buffer.html) | The response body.

```js
async onResponse (event) {
    if(event.statusCode === 200)
        console.log(event.headers['Content-Type']);
}
```