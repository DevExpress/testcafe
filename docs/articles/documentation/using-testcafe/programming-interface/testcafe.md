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

Creates the [test runner](runner.md) that is used to configure and launch test tasks.

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

### close

Stops the TestCafe server. Forcibly closes all connections and pending test runs immediately.

```text
async close()
```