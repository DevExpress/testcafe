---
layout: docs
title: LiveModeRunner Object
permalink: /documentation/reference/testcafe-api/livemoderunner.html
redirect_from:
  - /documentation/using-testcafe/programming-interface/livemoderunner.html
---
# LiveModeRunner Object

An object that configures and launches test tasks in [live mode](../../guides/basic-guides/run-tests.md#live-mode). In this mode, TestCafe watches the test files, and restarts the tests when you make changes.

Use the [testCafe.createLiveModeRunner](testcafe/createlivemoderunner.md) function to create a `LiveModeRunner`.

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

`LiveModeRunner` is a [Runner class](runner/README.md) descendant and provides the same API (with certain [limitations](#limitations)).

## Methods

* [src](runner/src.md)
* [filter](runner/filter.md)
* [browsers](runner/browsers.md)
* [screenshots](runner/screenshots.md)
* [reporter](runner/reporter.md)
* [concurrency](runner/concurrency.md)
* [startApp](runner/startapp.md)
* [useProxy](runner/useproxy.md)
* [run](runner/run.md)
* [stop](runner/stop.md)

## Limitations

A TestCafe server can create only one file system watcher that tracks changes to test files.

This implies the following limitations:

* You cannot create multiple live mode runners for a single [TestCafe server](testcafe/README.md) instance.
* You cannot call the [runner.run](runner/run.md) method more than once for a single `LiveModeRunner`.

In rare cases when you need multiple live mode sessions running in parallel, you can create several [TestCafe server instances](testcafe/README.md).
