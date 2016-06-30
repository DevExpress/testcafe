---
layout: docs
title: Programming Interface
permalink: /documentation/using-testcafe/programming-interface/
---
# Programming Interface

This section describes the API that allows you to run TestCafe tests from your NodeJS applications.

The thing to start with is creating the [TestCafe server](testcafe.md) instance.
Use the [createTestCafe](createtestcafe.md) factory function for this.

```js
const createTestCafe = require('testcafe');
const testCafe       = await createTestCafe('localhost', 1337, 1338);
```

This is the main point of access to TestCafe. You can now use it to create other entities required to execute tests:
the [remote browser connections](browserconnection.md)
and the [test runner](runner.md).

```js
const remoteConnection = testcafe.createBrowserConnection();
const runner           = testcafe.createRunner();
```

[Remote browser connections](browserconnection.md), as the name implies,
are used when you need to run tests on a remote device.

The [test runner](runner.md) is used to configure and launch test runs.
Here is how you can have it run tests from a `myFixture.js` fixture in the local Chrome and another remote browser
with the report provided in the JSON format.

```js
const failedCount = await runner
    .src('tests/myFixture.js')
    .browsers([remoteConnection, 'chrome'])
    .reporter('json')
    .run();
```

For details, see the reference topics below.

----

## Reference

* [createTestCafe factory function](createtestcafe.md)
* [TestCafe Class](testcafe.md)
* [Runner Class](runner.md)
* [BrowserConnection Class](browserconnection.md)