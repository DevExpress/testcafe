---
layout: docs
title: Concurrent Test Execution
permalink: /documentation/using-testcafe/common-concepts/concurrent-test-execution.html
---
# Concurrent Test Execution

To save time spent on testing, TestCafe allows you to execute tests concurrently.
There are two types of concurrency that take place when using TestCafe.

* [Cross-Browser Concurrency](#cross-browser-concurrency)
* [Single-Browser Concurrency](#single-browser-concurrency)

## Cross-Browser Concurrency

Cross-browser concurrency is in effect when you test against several browsers.

Assume that you run tests in Chrome and Firefox.

```sh
testcafe chrome,firefox tests/test.js
```

When this command is executed, TestCafe starts one Chrome and one Firefox instance
and runs tests from the `tests/test.js` file in two browsers simultaneously.

This behavior is defined by the way TestCafe works with multiple browser and it cannot be changed.

## Single-Browser Concurrency

Single-browser concurrency is an optional mode that allows you to invoke multiple instances of the same browser.
The test batch will be distributed across the browser instances so that each instance runs its portion of tests.

To enable single-browser concurrency, use the [-c or --concurrency](../command-line-interface.md#-c-factor---concurrency-factor)
command line option or the [runner.concurrency](../programming-interface/runner.md#concurrency) method of the programming interface.

The following command invokes three Chrome instances, divides tests from the `tests/test.js` file in three parts
runs each part in a separate browser instance.

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

Note that you can also use this type of concurrency when testing against multiple browsers.

```sh
testcafe -c 4 safari,firefox tests/test.js
```

In this case, tests will be distributed across four Safari instances and the same tests will also run in four Firefox instances.

When you run tests on [remote devices](../command-line-interface.md#remote-browsers),
create connections for each instance of each browser you test against. When using
the command line interface, specify this number after the `remote:` keyword. In API, create
a [browser connection](../programming-interface/browserconnection.md) for each instance.

On a remote device, invoke all the required instances manually. The total number of instances
should divide by `factor`. Otherwise, an exception will be thrown.

```sh
testcafe -c 2 remote:4 tests/test.js
```

If you test against multiple remote browsers, open and connect all instances of one browser before connecting the next browser.