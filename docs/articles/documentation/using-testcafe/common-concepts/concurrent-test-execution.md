---
layout: docs
title: Concurrent Test Execution
permalink: /documentation/using-testcafe/common-concepts/concurrent-test-execution.html
---
# Concurrent Test Execution

To save time spent on testing, TestCafe allows you to execute tests *concurrently*.

Normally, you run tests with a command similar to the following one.

```sh
testcafe chrome tests/test.js
```

When this command is executed, TestCafe invokes an instance of the specified browser and runs tests in it.

*Concurrency* is an optional mode that allows you to invoke multiple instances of the same browser.
These instances constitute the pool of browsers against which tests run concurrently, i.e. each test runs in the first free instance.

To enable concurrency, use the [-c or --concurrency](../command-line-interface.md#-c-n---concurrency-n)
command line option or the [runner.concurrency](../programming-interface/runner.md#concurrency) method of the programming interface.

> Important! Concurrent test execution is not supported in Microsoft Edge. This is because there is no known way to start Edge in a new window and make it open a particular URL.

The following command invokes three Chrome instances and runs tests concurrently.

```sh
testcafe -c 3 chrome tests/test.js
```

This is how the same thing can be done through the API.

```js
var testRunPromise = runner
    .src('tests/test.js')
    .browsers('chrome')
    .concurrency(3)
    .run();
```

Note that you can also use concurrency when testing against multiple browsers.

```sh
testcafe -c 4 safari,firefox tests/test.js
```

In this case, tests will be distributed across four Safari instances and the same tests will also run in four Firefox instances.

When you run tests on [remote devices](../command-line-interface.md#remote-browsers),
create connections for each instance of each browser you test against. When using
the command line interface, specify this number after the `remote:` keyword. In API, create
a [browser connection](../programming-interface/browserconnection.md) for each instance.

On a remote device, invoke all the required instances manually. The total number of instances
should divide by the concurrency parameter `n`. Otherwise, an exception will be thrown.

```sh
testcafe -c 2 remote:4 tests/test.js
```

If you test against multiple remote browsers, open and connect all instances of one browser before connecting the next browser.