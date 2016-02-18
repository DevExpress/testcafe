---
layout: docs
title: TestCafe Class
permalink: /documentation/using-testcafe/programming-interface/TestCafe/
---
# TestCafe Class

A TestCafe server.

To create an instance, use the [createTestCafe](/testcafe/documentation/using-testcafe/programming-interface/createTestCafe/) factory function.

**Example**

```js
const createTestCafe = require('testcafe');
const testCafe       = await createTestCafe('localhost', 1337, 1338);
```

## Methods

### createBrowserConnection

Creates a [remote browser connection](/testcafe/documentation/using-testcafe/programming-interface/BrowserConnection/).

```text
createBrowserConnection() → BrowserConnection
```

To connect a remote browser, navigate it to [BrowserConnection.url](/testcafe/documentation/using-testcafe/programming-interface/BrowserConnection/#url).

**Example**

```js
const createTestCafe   = require('testcafe');
const testCafe         = await createTestCafe('localhost', 1337, 1338);

const remoteConnection = testcafe.createBrowserConnection();

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

Creates the [test runner](/testcafe/documentation/using-testcafe/programming-interface/Runner/) that is used to configure and launch test runs.

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