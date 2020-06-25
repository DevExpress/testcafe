---
layout: docs
title: TestCafe Object
permalink: /documentation/reference/testcafe-api/testcafe/
redirect_from:
  - /documentation/using-testcafe/programming-interface/testcafe.html
---
# TestCafe Object

A TestCafe server instance.

To create it, use the [createTestCafe](../global/createtestcafe.md) function.

The `TestCafe` object creates test runners that launch tests and browser connections for remote testing.

Method                                                | Description
----------------------------------------------------- | ----------
[createBrowserConnection](createbrowserconnection.md) | Creates a [remote browser connection](../browserconnection/README.md).
[createRunner](createrunner.md)                       | Creates a [test runner](../runner/README.md) that is used to configure and launch test tasks.
[createLiveModeRunner](createlivemoderunner.md)       | Creates a [test runner](../livemoderunner.md) that runs TestCafe in [live mode](../../../guides/basic-guides/run-tests.md#live-mode).
[close](close.md)                                     | Stops the TestCafe server.

**Example**

```js
const createTestCafe = require('testcafe');

const testcafe          = await createTestCafe('localhost', 1337, 1338);
const browserConnection = await testcafe.createBrowserConnection();

console.log(browserConnection.url);
await new Promise(resolve => browserConnection.once('ready', resolve));

const runner      = testcafe.createRunner();
const failedTests = await runner
    .src(['tests/fixture1.js', 'tests/func/fixture3.js'])
    .browsers([browserConnection, 'safari'])
    .run();
```
