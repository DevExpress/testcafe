---
layout: docs
title: Fixture.requestHooks Method
permalink: /documentation/reference/test-api/fixture/requesthooks.html
---
# Fixture.requestHooks Method

Attaches the [request hooks](../../../guides/advanced-guides/intercept-http-requests.md) to the fixture.

```text
fixture.requestHooks(...hooks)
```

Parameter | Type | Description
--------- | ---- | ------------
`hooks`    | RequestHook subclass | A [RequestLogger](../requestlogger/README.md), [RequestMock](../requestmock/README.md) or custom user-defined hook.

> The `fixture.requestHooks` method uses the rest operator, which allows you to pass multiple hooks as parameters or arrays of hooks.

Request hooks attached to a fixture intercept requests from all tests in this fixture.

You can also use the [test.requestHooks](../test/requesthooks.md) method to attach request hooks to an individual test.

> Request hooks attached to a fixture are invoked before the hooks attached to individual tests.

The [t.addRequestHooks](../testcontroller/addrequesthooks.md) method allows you to attach request hooks throughout test execution.

To remove attached request hooks, use the [t.removeRequestHooks](../testcontroller/removerequesthooks.md) method.
