---
layout: docs
title: LiveModeRunner Class
permalink: /documentation/using-testcafe/programming-interface/livemoderunner.html
---
# LiveModeRunner Class

An object that configures and launches test tasks in [live mode](../common-concepts/live-mode.md). In this mode, TestCafe watches for changes you make in the test files. These changes immediately restart the tests so that you can see the effect.

Use the [testCafe.createLiveModeRunner](testcafe.md#createlivemoderunner) function to create a `LiveModeRunner`.

**Example**

```js
const createTestCafe = require('testcafe');
let testcafe         = null;

createTestCafe('localhost', 1337, 1338)
    .then(tc => {
        testcafe         = tc;
        const liveRunner = testcafe.createLiveModeRunner();

        return liveRunner
            .src('tests/test.js')
            .browsers('chrome')
            .run();
    })
    .then(() => {
        testcafe.close();
    });
```

`LiveModeRunner` is a [Runner class](runner.md) descendant and provides the same API (with certain [limitations](#limitations)).

## Methods

* [src](runner.md#src)
* [filter](runner.md#filter)
* [browsers](runner.md#browsers)
* [screenshots](runner.md#screenshots)
* [reporter](runner.md#reporter)
* [concurrency](runner.md#concurrency)
* [startApp](runner.md#startapp)
* [useProxy](runner.md#useproxy)
* [run](runner.md#run)
* [stop](runner.md#stop)

## Limitations

A TestCafe server can create only one file system watcher that tracks changes to test files.

This implies the following limitations:

* You cannot create multiple live mode runners for a single [TestCafe server](testcafe.md) instance.
* You cannot call the [runner.run](runner.md#run) method more than once for a single `LiveModeRunner`.

In rare cases when you need multiple live mode sessions running in parallel, you can create several [TestCafe server instances](testcafe.md).