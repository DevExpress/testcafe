---
layout: docs
title: TestCafe Class
permalink: /documentation/using-testcafe/programming-interface/testcafe.html
checked: true
---
# TestCafe Class

A TestCafe server.

To create a server instance, use the [createTestCafe](createtestcafe.md) factory function.

**Example**

```js
const createTestCafe = require('testcafe');

createTestCafe('localhost', 1337, 1338)
    .then(testcafe => {
        /* ... */
    });
```

## Methods

* [createBrowserConnection](#createbrowserconnection)
* [createRunner](#createrunner)
* [createLiveModeRunner](#createlivemoderunner)
* [close](#close)

### createBrowserConnection

Creates a [remote browser connection](browserconnection.md).

```text
async createBrowserConnection() → Promise<BrowserConnection>
```

To connect a remote browser, navigate it to [BrowserConnection.url](browserconnection.md#url).

**Example**

```js
const createTestCafe = require('testcafe');
let runner           = null;
let testcafe         = null;

createTestCafe('localhost', 1337, 1338)
    .then(tc => {
        testcafe = tc;
        runner   = testcafe.createRunner();

        return testcafe.createBrowserConnection();
    })
    .then(remoteConnection => {

        // Outputs remoteConnection.url so that it can be visited from the remote browser.
        console.log(remoteConnection.url);

        remoteConnection.once('ready', () => {
            runner
                .src('test.js')
                .browsers(remoteConnection)
                .run()
                .then(failedCount => {
                    console.log(failedCount);
                    testcafe.close();
                 })
                .catch(error => { /* ... */});
        });
    });
```

### createRunner

Creates a [test runner](runner.md) that is used to configure and launch test tasks.

```text
createRunner() → Runner
```

**Example**

```js
const createTestCafe = require('testcafe');
let testcafe         = null;

createTestCafe('localhost', 1337, 1338)
    .then(tc => {
        testcafe     = tc;
        const runner = testcafe.createRunner();

        return runner
            .src(['tests/fixture1.js', 'tests/func/fixture3.js'])
            .browsers(['chrome', 'safari'])
            .run();
    })
    .then(failedCount => {
        console.log('Tests failed: ' + failedCount);
        testcafe.close();
    });
```

### createLiveModeRunner

Creates a [test runner](livemoderunner.md) that runs TestCafe in [live mode](../common-concepts/live-mode.md). In this mode, TestCafe watches for changes you make in the test files and all files referenced in them (like page objects or helper modules). These changes immediately restart the tests so that you can see the effect.

```text
createLiveModeRunner() → LiveModeRunner
```

[LiveModeRunner](livemoderunner.md) is a [Runner](runner.md) descendant and provides the same API (with certain [limitations](livemoderunner.md#limitations)).

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

> Important! You cannot create multiple live mode runners for the same TestCafe server instance. This is because a TestCafe server can handle only one watcher that tracks changes to test files.

### close

Stops the TestCafe server. Forcibly closes all connections and pending test runs.

```text
async close()
```