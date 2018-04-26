---
layout: docs
title: Creating a Custom HTTP Request Hook
permalink: /documentation/test-api/intercepting-and-mocking-http-requests/creating-a-custom-http-request-hook.html
checked: false
---
# Creating a Custom HTTP Request Hook

To handle HTTP requests in a custom way, you can create your own request hook. This topic provides basic information on how request hooks work and what you need to do to create a custom hook.

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

    This class has the following public interface.

    ```js
    class RequestHook {
        constructor (requestFilterRules, responseEventConfigureOpts) {
            // ...
        }

        onRequest (event) {
            // ...
        }

        onResponse (event) {
            // ...
        }
    }
    ```

* To determine which requests the hook handles, the base class constructor receives an array of [filtering rules](specifying-which-requests-are-handled-by-the-hook.md) as the first parameter. If no rules are passed, all requests are handled.

    ```js
    class RequestHook {
        constructor (requestFilterRules, /* other params */) {
            console.log(requestFilterRules[0]); // http://example.com
            console.log(requestFilterRules[1]); // /\/api\/users\//
        }
    }
    ```

* Before sending the request, the `onRequest` method is called. Use this method to handle the request sending. If necessary, you can change the request parameters before it is sent.

    This method is abstract in the base class and needs to be overriden in the descendant.

    ```js
    onRequest (/*RequestEvent event*/) {
        throw new Error('Not implemented');
    }
    ```

* When a response is received, the hook starts preparing to call the `onResponse` method that handles the response.

    At this moment, the hook processes settings that define whether to pass the response headers and body to the `onResponse` method. These settings are specified in the second constructor parameter. This parameter takes an object with two properties - `includeHeaders` and `includeBody`.

    ```js
    class RequestHook {
        constructor (requestFilterRules, responseEventConfigureOpts) {
            console.log(responseEventConfigureOpts.includeHeaders); // false
            console.log(responseEventConfigureOpts.includeBody);    // false
        }
    }
    ```

* After all the necessary preparations are done, the `onResponse` method is called. This method is abstract in the base class. Override it in the descendant to handle the request sending.

    ```js
    onResponse (/*ResponseEvent event*/) {
        throw new Error('Not implemented');
    }
    ```

## Writing a Hook

To sum up, this is what you need to write a custom hook.

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
    onRequest (event) {
        // ...
    }
    onResponse (event) {
        // ...
    }
}
```

The `onRequest` and `onResponse` methods receive an object that contains the event parameters.

### The onRequest Method

The `onRequest` method's `event` object exposes the following fields.

Property | Type | Description
-------- | ---- | --------------
`requestOptions` | Object | Contains the request parameters. You can use it to change the request parameters before the request is sent.
`isAjax`         | Boolean | Specifies if the request is performed using AJAX.

The `requestOptions` object has the following properties.

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
`credentials` | Object | Credentials that were used to authenticate in the current session using NTLM or Basic authentication. For HTTP Basic authentication, these are `username` and `password`. NTLM authentication additionally specifies `workstation` and `domain`. See [HTTP Authentication](../authentication/http-authentication.md).
`proxy`       | Object | If a proxy is used, contains information about its `host`, `hostname`, `port`, `proxyAuth`, `authHeader` and `bypassRules`.

```js
onRequest (event) {
    if(event.isAjax) {
        console.log(event.requestOptions.url);
        console.log(event.requestOptions.credentials.username);

        event.requestOptions.headers['custom-header'] = 'value';
    }
}
```

### The onResponse Method

The `onResponse` method's `event` object exposes the following properties.

Property | Type | Description
-------- | ---- | --------------
`statusCode` | Number | The response status code.
`headers`    | Object | The response headers in a property-value form.
`body`       | [Buffer](https://nodejs.org/api/buffer.html) | The response body.

```js
onResponse (event) {
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