---
layout: docs
title: RequestLogger.contains Method
permalink: /documentation/reference/test-api/requestlogger/contains.html
---
# RequestLogger.contains Method

Returns whether the logger contains a request that matches the predicate.

```text
contains( predicate(Request) ) → Promise<Boolean>
```

> If you use the `contains(predicate)` or `count(predicate)` methods in assertions, TestCafe uses the [Smart Assertion Query Mechanism](../../../guides/basic-guides/assert.md#smart-assertion-query-mechanism).

The predicate accepts a `Request` as the only parameter.

{% include intercept-http-requests/request-object.md %}