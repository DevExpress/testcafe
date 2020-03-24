---
layout: docs
title: t.expect Method
permalink: /documentation/reference/test-api/testcontroller/expect/README.html
---
# t.expect() Method

This method accepts the actual value. You can pass a value, a [Selector's DOM node state property](../../../../guides/basic-guides/select-page-elements.md#define-assertion-actual-value)
or a [client function](../../../../guides/basic-guides/obtain-data-from-the-client.md) promise.
TestCafe automatically waits for node state properties to obtain a value and for client functions to execute.
See [Smart Assertion Query Mechanism](../../../../guides/basic-guides/assert.md#smart-assertion-query-mechanism) for details.

> You cannot pass a regular promise to the `expect` method unless the options.allowUnawaitedPromise option is enabled.

> {% include assertions/allowUnawaitedPromise.md %}
