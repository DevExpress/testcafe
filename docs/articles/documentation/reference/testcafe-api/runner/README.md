---
layout: docs
title: Runner Object
permalink: /documentation/reference/testcafe-api/runner/
redirect_from:
  - /documentation/using-testcafe/programming-interface/runner.html
  - /documentation/using-testcafe/programming-interface/
---
# Runner Object

An object that configures and launches test tasks.

Use the [testCafe.createRunner](../testcafe/createrunner.md) method to create a `Runner`.

The following methods configure test runner settings required to start tests:

Method                  | Description
----------------------- | ---------------------
[browsers](browsers.md) | Specifies the browsers in which tests run.
[src](src.md)           | Configures the test runner to run tests from the specified locations.

You can also use the following methods to configure other options:

Method                  | Description
----------------------- | ---------------------
[clientScripts](clientscripts.md) | Injects scripts into pages visited during the tests.
[concurency](concurrency.md)      | Specifies that tests should run concurrently.
[filter](filter.md)               | Allows you to select the tests to run.
[reporter](reporter.md)           | Configures how TestCafe generates test run reports.
[screenshots](screenshots.md)     | Specifies how TestCafe should take screenshots of the tested pages.
[startApp](startapp.md)           | Specifies a shell command that is executed before TestCafe runs tests.
[tsConfigPath](tsconfigpath.md)   | Enables TestCafe to use a custom [TypeScript configuration file](../../../guides/concepts/typescript-and-coffeescript.md#customize-compiler-options) and specifies its location.
[useProxy](useproxy.md)           | Specifies the proxy server used in your local network to access the Internet.
[video](video.md)                 | Enables TestCafe to record videos of test runs.

Call the [runner.run](run.md) method after the configuration methods to run tests.

You can stop all test runs with the [runner.stop](stop.md) method.

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
