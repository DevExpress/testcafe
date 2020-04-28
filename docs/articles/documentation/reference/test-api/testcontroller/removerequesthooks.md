---
layout: docs
title: TestController.removeRequestHooks Method
permalink: /documentation/reference/test-api/testcontroller/removerequesthooks.html
---
# TestController.removeRequestHooks Method

Removes the attached [request hooks](../../../guides/advanced-guides/intercept-http-requests.md) from the test.

```text
t.removeRequestHooks(...hooks)
```

Parameter | Type | Description
--------- | ---- | ------------
`hooks`    | RequestHook subclass | A [RequestLogger](../requestlogger/README.md), [RequestMock](../requestmock/README.md) or custom user-defined hook.

> The `t.removeRequestHooks` method uses the rest operator that allows you to pass multiple hooks as parameters or arrays of hooks.

To attach request hooks, use the [t.addRequestHooks](addrequesthooks.md), [test.requestHooks](../test/requesthooks.md) and [fixture.requestHooks](../fixture/requesthooks.md) methods.
