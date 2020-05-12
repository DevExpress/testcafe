---
layout: docs
title: RequestHook Constructor
permalink: /documentation/reference/test-api/requesthook/constructor.html
---
# RequestHook Constructor

Initializes the request hook.

```js
class MyRequestHook extends RequestHook {
    constructor (requestFilterRules, responseEventOptions) {
        /* ... */
    }
}
```

Parameter            | Type  | Description
-------------------- | ----- | ------
`requestFilterRules` | String &#124; RegExp &#124; Object &#124; Predicate &#124; Array | Specifies which requests the hook should handle. See [Select Requests to be Handled by the Hook](#select-requests-to-be-handled-by-the-hook).
`responseEventOptions` | Object | The `responseEventOptions.includeHeaders` and `responseEventOptions.includeBody` properties indicate if the response's headers and body should be passed to the [onResponse](onresponse.md) method.

Pass the `requestFilterRules` and `responseEventOptions` parameters to the base class constructor. This enables TestCafe to handle and apply these settings:

```js
class MyRequestHook extends RequestHook {
    constructor (requestFilterRules, responseEventOptions) {
        super(requestFilterRules, responseEventOptions);
    }
}
```

{% include intercept-http-requests/request-filter.md %}