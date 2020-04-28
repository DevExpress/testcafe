---
layout: docs
title: Test.requestHooks Method
permalink: /documentation/reference/test-api/test/requesthooks.html
---
# Test.requestHooks Method

Attaches the [request hooks](../../../guides/advanced-guides/intercept-http-requests.md) to the test.

```text
test.requestHooks(...hooks)
```

Parameter | Type | Description
--------- | ---- | ------------
`hooks`    | RequestHook subclass | A [RequestLogger](../requestlogger/README.md), [RequestMock](../requestmock/README.md) or custom user-defined hook.

> The `test.requestHooks` method uses the rest operator which allows you to pass multiple hooks as parameters or arrays of hooks.

Request hooks attached to a test intercept HTTP requests sent during its execution.

You can also use the [fixture.requestHooks](../fixture/requesthooks.md) method to attach request hooks to a fixture. These hooks handle HTTP requests in all tests in this fixture.

> Request hooks attached to a fixture are invoked before hooks attached to its tests.

The [t.addRequestHooks](../testcontroller/addrequesthooks.md) method allows you to attach request hooks throughout test execution.

Use the [t.removeRequestHooks](../testcontroller/removerequesthooks.md) method to remove attached request hooks.
