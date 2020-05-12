---
layout: docs
title: RequestHook Class
permalink: /documentation/reference/test-api/requesthook/
---
# RequestHook Class

The base class for [custom request hooks](../../../guides/advanced-guides/intercept-http-requests.md#create-a-custom-request-hook).

```js
class RequestHook {
    constructor (requestFilterRules, responseEventConfigureOpts)
    async onRequest (event)
    async onResponse (event)
}
```

Inherit a class from `RequestHook` to implement a custom hook:

```js
import { RequestHook } from 'testcafe';

class JwtBearerAuthorization extends RequestHook {
    constructor () {
        super();
    }

    onRequest (e) {
        e.requestOptions.headers['Authorization'] = 'generate token here';
    }

    onResponse (e) {
    }
}
```

## Filter Rules

The `RequestHook` [constructor](constructor.md) receives an array of [filter rules](constructor.md#select-requests-to-be-handled-by-the-hook) as the first parameter to determine which requests the hook handles. The hook processes all requests if no rules are passed.

```js
class MyHook extends RequestHook {
    constructor (requestFilterRules, responseEventOptions) {
        console.log(requestFilterRules[0]); // https://example.com
        console.log(requestFilterRules[1]); // /auth.mycorp.com/
    }
}
```

When you inherit from `RequestHook`, pass `requestFilterRules` to the base class constructor for TestCafe to handle them.

```js
class MyHook extends RequestHook {
    constructor (requestFilterRules, responseEventOptions) {
        super(requestFilterRules, responseEventOptions);
    }
}
```

## Request Handler

The [onRequest](onrequest.md) asynchronous method is called before TestCafe sends the request. You can change the request parameters in this method or handle the request in a custom manner.

This method is abstract in the base class and needs to be overridden in the subclass.

```js
async onRequest (event) {
    throw new Error('Not implemented');
}
```

## Response Handler Options

When TestCafe receives a response, the hook prepares to call the [onResponse](onresponse.md) method that handles the response.

At this moment, the hook processes settings that define whether to pass the response headers and body to the [onResponse](onresponse.md) method. These settings are specified in the second [constructor](constructor.md) parameter. This parameter takes an object with the `includeHeaders` and `includeBody` properties that have the `false` value by default.

```js
class MyHook extends RequestHook {
    constructor (requestFilterRules, responseEventOptions) {
        console.log(responseEventOptions.includeHeaders); // false
        console.log(responseEventOptions.includeBody);    // false
    }
}
```

When you inherit from `RequestHook`, pass `responseEventOptions` to the base class constructor for TestCafe to handle them.

```js
class MyHook extends RequestHook {
    constructor (requestFilterRules, responseEventOptions) {
        super(requestFilterRules, responseEventOptions);
    }
}
```

## Response Handler

At the last step, the [onResponse](onresponse.md) asynchronous method is called. This is an abstract method in the base class. Override it in the descendant to handle the response.

```js
async onResponse (event) {
    throw new Error('Not implemented');
}
```
