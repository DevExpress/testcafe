---
layout: docs
title: Runner.run Method
permalink: /documentation/reference/testcafe-api/runner/run.html
---
# Runner.run Method

Runs tests according to the current configuration. Returns the number of failed tests.

```text
async run(options) → Promise<Number>
```

Before TestCafe runs tests, it reads settings from the `.testcaferc.json` [configuration file](../../configuration-file.md) if this file exists. Then it applies settings specified in the programming API. API settings override values from the configuration file in case they differ. TestCafe prints information about every overridden property in the console.

> Important! Make sure to keep the browser tab that runs tests active. Do not minimize the browser window.
> Inactive tabs and minimized browser windows switch to a lower resource consumption mode
> where tests are not guaranteed to execute correctly.

You can pass the following options to the `runner.run` function.

Parameter         | Type    | Description                                                                                                                                                                           | Default
----------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------
`skipJsErrors`    | Boolean | Defines whether to continue a test after a JavaScript error occurs on a page (`true`), or consider such a test failed (`false`).                                              | `false`
`skipUncaughtErrors` | Boolean | Defines whether to continue a test after an uncaught error or unhandled promise rejection occurs on the server (`true`), or consider such a test failed (`false`).                                              | `false`
`quarantineMode`  | Boolean | Defines whether to enable the [quarantine mode](../../../guides/basic-guides/run-tests.md#quarantine-mode).                                                                                                                    | `false`
`debugMode`       | Boolean | Specifies if tests run in the debug mode. If this option is enabled, test execution is paused before the first action or assertion so that you can invoke the developer tools and debug. In the debug mode, you can execute the test step-by-step to reproduce its incorrect behavior. You can also use the **Unlock page** switch in the footer to unlock the tested page and interact with its elements. | `false`
`debugOnFail`     | Boolean | Specifies whether to enter the debug mode when a test fails. If enabled, the test is paused at the moment it fails, so that you can explore the tested page to determine what caused the failure. | `false`
`selectorTimeout` | Number  | Specifies the time (in milliseconds) within which [selectors](../../../guides/basic-guides/select-page-elements.md) make attempts to obtain a node to be returned. See [Selector Timeout](../../../guides/basic-guides/select-page-elements.md#selector-timeout). | `10000`
`assertionTimeout` | Number  | Specifies the time (in milliseconds) within which TestCafe makes attempts  to successfully execute an [assertion](../../../guides/basic-guides/assert.md) if [a selector property](../../../guides/basic-guides/select-page-elements.md#define-assertion-actual-value) or a [client function](../../../guides/basic-guides/obtain-client-side-info.md) was passed as an actual value. See [Smart Assertion Query Mechanism](../../../guides/basic-guides/assert.md#smart-assertion-query-mechanism). | `3000`
`pageLoadTimeout` | Number  |  Specifies the time (in milliseconds) TestCafe waits for the `window.load` event to fire after the `DOMContentLoaded` event. After the timeout passes or the `window.load` event is raised (whichever happens first), TestCafe starts the test. You can set this timeout to `0` to skip waiting for `window.load`. | `3000`
`speed`           | Number  | Specifies the test execution speed. A number between `1` (fastest) and `0.01` (slowest). If an individual action's speed is also specified, the action speed setting overrides the test speed. | `1`
`stopOnFirstFail`    | Boolean | Defines whether to stop a test run if a test fails. You do not need to wait for all the tests to finish to focus on the first error. | `false`
`disablePageCaching` | Boolean | Prevents the browser from caching page content. When navigation to a cached page occurs in [role code](../../../guides/advanced-guides/authentication.md), local and session storage content is not preserved. Set `disablePageCaching` to `true` to retain the storage items after navigation. For more information, see [Troubleshooting: Test Actions Fail After Authentication](../../../guides/advanced-guides/authentication.md#test-actions-fail-after-authentication). You can also disable page caching for an individual [fixture](../../test-api/fixture/disablepagecaching.md) or [test](../../test-api/test/disablepagecaching.md).
`disableScreenshots` | Boolean | Prevents TestCafe from taking screenshots. When this option is specified, screenshots are not taken whenever a test fails or when [t.takeScreenshot](../../test-api/testcontroller/takescreenshot.md) or [t.takeElementScreenshot](../../test-api/testcontroller/takeelementscreenshot.md) is executed.

After all tests are finished, call the [testcafe.close](../testcafe/close.md) function to stop the TestCafe server.

*Related configuration file properties*:

* [skipJsErrors](../../configuration-file.md#skipjserrors)
* [skipUncaughtErrors](../../configuration-file.md#skipuncaughterrors)
* [quarantineMode](../../configuration-file.md#quarantinemode)
* [debugMode](../../configuration-file.md#debugmode)
* [debugOnFail](../../configuration-file.md#debugonfail)
* [selectorTimeout](../../configuration-file.md#selectortimeout)
* [assertionTimeout](../../configuration-file.md#assertiontimeout)
* [pageLoadTimeout](../../configuration-file.md#pageloadtimeout)
* [speed](../../configuration-file.md#speed)
* [stopOnFirstFail](../../configuration-file.md#stoponfirstfail)
* [disablePageCaching](../../configuration-file.md#disablepagecaching)
* [disableScreenshots](../../configuration-file.md#disablescreenshots)

**Example**

```js
const createTestCafe = require('testcafe');
let testcafe         = null;

createTestCafe('localhost', 1337, 1338)
    .then(tc => {
        testcafe     = tc;
        const runner = testcafe.createRunner();

        return runner.run({
            skipJsErrors: true,
            quarantineMode: true,
            selectorTimeout: 50000,
            assertionTimeout: 7000,
            pageLoadTimeout: 8000,
            speed: 0.1,
            stopOnFirstFail: true
        });
    })
    .then(failed => {
        console.log('Tests failed: ' + failed);
        testcafe.close();
    })
    .catch(error => { /* ... */ });
```

If a browser stops responding while it executes tests, TestCafe restarts the browser and reruns the current test in a new browser instance.
If the same problem occurs with this test two more times, the test run finishes and an error is thrown.

> When you use a [LiveModeRunner](../livemoderunner.md), you can call the `runner.run` method only once. In rare cases when you need multiple live mode sessions to run in parallel, you can create several [TestCafe server instances](../testcafe/README.md).

## Cancel Test Tasks

You can cancel a promise returned by 'runner.run' to stop an individual test task:

```js
const taskPromise = runner
    .src('tests/fixture1.js')
    .browsers([remoteConnection, 'chrome'])
    .reporter('json')
    .run();

taskPromise.cancel();
```

You can also cancel all pending tasks at once with the [runner.stop](stop.md) method.
