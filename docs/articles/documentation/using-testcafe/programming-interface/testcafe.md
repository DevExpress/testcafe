---
layout: docs
title: TestCafe Class
permalink: /documentation/using-testcafe/programming-interface/testcafe.html
---
# TestCafe Class

A TestCafe server.

To create an instance, use the [createTestCafe](createtestcafe.md) factory function.

**Example**

```js
const createTestCafe = require('testcafe');
const testCafe       = await createTestCafe('localhost', 1337, 1338);
```

## Methods

* [createBrowserConnection](#createbrowserconnection)
* [createRunner](#createrunner)
* [close](#close)

### createBrowserConnection

Creates a [remote browser connection](browserconnection.md).

```text
async createBrowserConnection() → BrowserConnection
```

To connect a remote browser, navigate it to [BrowserConnection.url](browserconnection.md#url).

**Example**

```js
const createTestCafe   = require('testcafe');
const testCafe         = await createTestCafe('localhost', 1337, 1338);

const remoteConnection = await testcafe.createBrowserConnection();

// Outputs remoteConnection.url to navigate the remote browser to it.
console.log(remoteConnection.url);

remoteConnection.once('ready', async () => {
    await testCafe
        .createRunner()
        .browsers(remoteConnection)
        .run();
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
const testCafe       = await createTestCafe('localhost', 1337, 1338);

const failed = await testCafe
    .createRunner()
    .src(['tests/fixture1.js', 'tests/func/fixture3.js'])
    .browsers(['chrome', 'safari'])
    .run();

console.log('Tests failed: ' + failed);
```

### close

Stops the TestCafe server. Forcibly closes all connections and pending test runs immediately.

```text
close()
```