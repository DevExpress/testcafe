---
layout: docs
title: TestController.addRequestHooks Method
permalink: /documentation/reference/test-api/testcontroller/addrequesthooks.html
---
# TestController.addRequestHooks Method

Attaches the [request hooks](../../../guides/advanced-guides/intercept-http-requests.md) to the test.

```text
t.addRequestHooks(...hooks)
```

Parameter | Type | Description
--------- | ---- | ------------
`hooks`    | RequestHook subclass | A [RequestLogger](../requestlogger/README.md), [RequestMock](../requestmock/README.md) or custom user-defined hook.

> The `t.addRequestHooks` method uses the rest operator that allows you to pass multiple hooks as parameters or arrays of hooks.

Once a request hook is attached, it intercepts HTTP requests sent during the subsequent test actions.

You can also use the [test.requestHooks](../test/requesthooks.md) and [fixture.requestHooks](../fixture/requesthooks.md) methods to attach request hooks to an individual test or a fixture. These methods attach hooks before test code starts, so they can handle all HTTP requests the page sends.

Use the [t.removeRequestHooks](removerequesthooks.md) method to remove attached request hooks.
