---
layout: docs
title: RequestLogger.count Method
permalink: /documentation/reference/test-api/requestlogger/count.html
---
# RequestLogger.count Method

Returns the number of requests that match the predicate.

```text
count( predicate(Request) ) → Promise<Numeric>
```

> If you use the `contains(predicate)` or `count(predicate)` methods in assertions, TestCafe uses the [Smart Assertion Query Mechanism](../../../guides/basic-guides/assert.md#smart-assertion-query-mechanism).

The predicate accepts a `Request` as the only parameter.

{% include intercept-http-requests/request-object.md %}