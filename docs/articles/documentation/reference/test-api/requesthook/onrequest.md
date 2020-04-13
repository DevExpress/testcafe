---
layout: docs
title: RequestHook.onRequest Method
permalink: /documentation/reference/test-api/requesthook/onrequest.html
---
# RequestHook.onRequest Method

Handles the request before it is sent.

```js
class MyRequestHook extends RequestHook {
    async onRequest (event) {
        // ...
    }
}
```

The `onRequest` method's `event` object exposes the following fields.

Property | Type | Description
-------- | ---- | --------------
`event.requestOptions` | [RequestOptions](#requestoptions) | Contains the request parameters. You can use it to change the request parameters before the request is sent.
`event.isAjax`         | Boolean | Specifies if the request is performed using AJAX.

```js
async onRequest (event) {
    if(event.isAjax) {
        console.log(event.requestOptions.url);
        console.log(event.requestOptions.credentials.username);

        event.requestOptions.headers['custom-header'] = 'value';
    }
}
```

## RequestOptions

{% include intercept-http-requests/requestoptions-object.md %}