---
layout: docs
title: Creating a Custom HTTP Request Hook
permalink: /documentation/test-api/intercepting-http-requests/creating-a-custom-http-request-hook.html
checked: true
---
# Creating a Custom HTTP Request Hook

You can create your own request hook to handle HTTP requests. This topic describes request hooks and how to create a custom hook.

* [Understanding How TestCafe Request Hooks Operate](#understanding-how-testcafe-request-hooks-operate)
* [Writing a Hook](#writing-a-hook)
  * [The onRequest Method](#the-onrequest-method)
  * [The onResponse Method](#the-onresponse-method)

## Understanding How TestCafe Request Hooks Operate

* All TestCafe request hooks inherit from the `RequestHook` class.

    ```js
    import { RequestHook } from 'testcafe';

    class MyRequestHook extends RequestHook {
        // ...
    }
    ```

    This class has the following public interface:

    ```js
    class RequestHook {
        constructor (requestFilterRules, responseEventConfigureOpts) {
            // ...
        }

        async onRequest (event) {
            // ...
        }

        async onResponse (event) {
            // ...
        }
    }
    ```

* The base class constructor receives an array of [filtering rules](specifying-which-requests-are-handled-by-the-hook.md) as the first parameter to determine which requests the hook handles. All requests are handled if no rules are passed.

    ```js
    class RequestHook {
        constructor (requestFilterRules, /* other params */) {
            console.log(requestFilterRules[0]); // http://example.com
            console.log(requestFilterRules[1]); // /\/api\/users\//
        }
    }
    ```

* The `onRequest` asynchronous method is called before the request is sent. Use this method to handle sending the request. You can change the request parameters before it is sent.

    This method is abstract in the base class and needs to be overriden in the subclass.

    ```js
    async onRequest (/*RequestEvent event*/) {
        throw new Error('Not implemented');
    }
    ```

* When a response is received, the hook starts preparing to call the `onResponse` method that handles the response.

    At this moment, the hook processes settings that define whether to pass the response headers and body to the `onResponse` method. These settings are specified in the second constructor parameter. This parameter takes an object with the `includeHeaders` and `includeBody` properties that have the `false` value by default.

    ```js
    class RequestHook {
        constructor (requestFilterRules, responseEventConfigureOpts) {
            console.log(responseEventConfigureOpts.includeHeaders); // false
            console.log(responseEventConfigureOpts.includeBody);    // false
        }
    }
    ```

* Finally, the `onResponse` asynchronous method is called. This an abstract method in the base class. Override it in the descendant to handle sending the request.

    ```js
    async onResponse (/*ResponseEvent event*/) {
        throw new Error('Not implemented');
    }
    ```

## Writing a Hook

Do the following to write a custom hook:

* inherit from the `RequestHook` class,
* override the `onRequest` method to handle sending the request,
* override the `onResponse` method to handle receiving the response.

```js
import { RequestHook } from 'testcafe';

class MyRequestHook extends RequestHook {
    constructor (requestFilterRules, responseEventConfigureOpts) {
        super(requestFilterRules, responseEventConfigureOpts);
        // ...
    }
    async onRequest (event) {
        // ...
    }
    async onResponse (event) {
        // ...
    }
}
```

The `onRequest` and `onResponse` methods receive an object that contains the event parameters.

### The onRequest Method

The `onRequest` method's `event` object exposes the following fields.

Property | Type | Description
-------- | ---- | --------------
`requestOptions` | [RequestOptions](requestoptions-object.md) | Contains the request parameters. You can use it to change the request parameters before the request is sent.
`isAjax`         | Boolean | Specifies if the request is performed using AJAX.

```js
async onRequest (event) {
    if(event.isAjax) {
        console.log(event.requestOptions.url);
        console.log(event.requestOptions.credentials.username);

        event.requestOptions.headers['custom-header'] = 'value';
    }
}
```

### The onResponse Method

The `onResponse` method's `event` object exposes the following properties:

Property | Type | Description
-------- | ---- | --------------
`statusCode` | Number | The response status code.
`headers`    | Object | The response headers in a property-value form.
`body`       | [Buffer](https://nodejs.org/api/buffer.html) | The response body.

```js
async onResponse (event) {
    if(event.statusCode === 200)
        console.log(event.headers['Content-Type']);
}
```

Now you can [attach this hook to a test or fixture](attaching-hooks-to-tests-and-fixtures.md) in your test suite and start using it.

```js
import { MyRequestHook } from './my-request-hook';

const customHook = new MyRequestHook('http://example.com');

fixture `My fixture`
    .page('http://example.com')
    .requestHooks(customHook);

test('My test', async t => {
        // test actions
});
```
