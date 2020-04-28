---
layout: docs
title: Runner.concurrency Method
permalink: /documentation/reference/testcafe-api/runner/concurrency.html
---
# Runner.concurrency Method

Specifies that tests should run concurrently.

```text
concurrency(n) → this
```

TestCafe opens `n` instances of the same browser and creates a pool of browser instances.
Tests run concurrently against this pool, that is, each test runs in the first available instance.

The `concurrency` function takes the following parameters:

Parameter | Type    | Description
--------- | ------- | --------
`n`  | Number | The number of browser instances that are invoked.

See [Concurrent Test Execution](../../../guides/basic-guides/run-tests.md#run-tests-concurrently) to learn more about concurrent test execution.

*Related configuration file property*: [concurrency](../../configuration-file.md#concurrency)

The following example shows how to run tests in three Chrome instances:

```js
runner
    .browsers('chrome')
    .concurrency(3);
```
