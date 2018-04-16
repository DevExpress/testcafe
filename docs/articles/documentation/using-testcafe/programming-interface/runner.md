---
layout: docs
title: Runner Class
permalink: /documentation/using-testcafe/programming-interface/runner.html
checked: true
---
# Runner Class

An object that configures and launches test tasks.

Created by the [testCafe.createRunner](testcafe.md#createrunner) function.

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

## Methods

* [src](#src)
* [filter](#filter)
* [browsers](#browsers)
    * [Using Browser Aliases](#using-browser-aliases)
    * [Specifying the Path to the Browser Executable](#specifying-the-path-to-the-browser-executable)
    * [Specifying the Path with Command Line Parameters](#specifying-the-path-with-command-line-parameters)
    * [Passing a Remote Browser Connection](#passing-a-remote-browser-connection)
* [screenshots](#screenshots)
* [reporter](#reporter)
    * [Specifying the Reporter](#specifying-the-reporter)
    * [Saving the Report to a File](#saving-the-report-to-a-file)
    * [Using Multiple Reporters](#using-multiple-reporters)
    * [Implementing a Custom Stream](#implementing-a-custom-stream)
* [concurrency](#concurrency)
* [startApp](#startapp)
* [useProxy](#useproxy)
* [run](#run)
    * [Cancelling Test Tasks](#cancelling-test-tasks)
    * [Quarantine Mode](#quarantine-mode)
* [stop](#stop)

### src

Configures the test runner to run tests from the specified files.

```text
src(source) → this
```

Parameter | Type                | Description
--------- | ------------------- | ----------------------------------------------------------------------------
`source`  | String &#124; Array | The relative or absolute path to a test fixture file, or several such paths.

Concatenates the settings when called several times.

**Example**

```js
runner.src(['/home/user/tests/fixture1.js', 'fixture5.js']);
```

### filter

Allows you to manually select which tests should be run.

```text
filter(callback) → this
```

Parameter  | Type                                           | Description
---------- | ---------------------------------------------- | ----------------------------------------------------------------
`callback` | `function(testName, fixtureName, fixturePath)` | The callback that determines if a particular test should be run.

The callback function is called for each test in files that are specified using the [src](#src) method.

Return `true` from the callback to include the current test, or `false` to exclude it.

The callback function takes the following arguments.

Parameter     | Type   | Description
------------- | ------ | ----------------------------------
`testName`    | String | The name of the test.
`fixtureName` | String | The name of the test fixture.
`fixturePath` | String | The path to the test fixture file.

**Example**

```js
runner.filter((testName, fixtureName, fixturePath) => {
    return fixturePath.startsWith('D') &&
        testName.match(someRe) &&
        fixtureName.match(anotherRe);
});
```

### browsers

Configures the test runner to run tests in the specified browsers.

```text
browsers(browser) → this
```

The `browser` parameter can be any of the following objects, or an `Array` of them.

Parameter Type                                                                                        | Description                            | Browser Type
---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------
String                                                                                                | The browser alias that differs for different browser types. For details, see [Browser Support](../common-concepts/browsers/browser-support.md).                            | [Local browsers](../common-concepts/browsers/browser-support.md#locally-installed-browsers), [cloud browsers](../common-concepts/browsers/browser-support.md#browsers-in-cloud-testing-services) and [browsers accessed through *browser provider plugins*](../common-concepts/browsers/browser-support.md#nonconventional-browsers).                                                                 |
 `{path: String, cmd: String}`                                                                        | The path to the browser executable (`path`) and command line parameters (`cmd`). The `cmd` property is optional.                                                     | [Local](../common-concepts/browsers/browser-support.md#locally-installed-browsers) and [portable](../common-concepts/browsers/browser-support.md#portable-browsers) browsers
[BrowserConnection](browserconnection.md)                                                            | The remote browser connection.                                                                                                                                        | [Remote browsers](../common-concepts/browsers/browser-support.md#browsers-on-remote-devices)

You are free to mix different types of objects in one function call. The `browsers` function concatenates the settings when called several times.

#### Using Browser Aliases

* running local browsers

```js
runner.browsers(['safari', 'chrome']);
```

* running browsers accessed through browser provider plugins

```js
runner.browsers('saucelabs:Chrome@52.0:Windows 8.1');
```

* using [headless mode](../common-concepts/browsers/testing-in-headless-mode.md)

```js
runner.browsers('chrome:headless');
```

#### Specifying the Path to the Browser Executable

Use the `path:` prefix. If the path contains spaces, surround it with backticks.

```js
runner.browsers('path:`C:\\Program Files\\Internet Explorer\\iexplore.exe`');
```

#### Specifying the Path with Command Line Parameters

```js
runner.browsers({
    path: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    cmd: '--new-window'
});
```

#### Passing a Remote Browser Connection

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
                 });
        });
    });
```

### screenshots

Enables TestCafe to take screenshots of the tested webpages.

```text
screenshots(path [, takeOnFails]) → this
```

Parameter                  | Type    | Description                                                                   | Default
-------------------------- | ------- | ----------------------------------------------------------------------------- | -------
`path`                     | String  | The path to which the screenshots will be saved.
`takeOnFails`&#160;*(optional)* | Boolean | Specifies if screenshots should be taken automatically whenever a test fails. | `false`

The `screenshots` function must be called to enable TestCafe to take screenshots
when the [t.takeScreenshot](../../test-api/actions/take-screenshot.md) action is called from test code.

Set the `takeOnFails` parameter to `true` to additionally take a screenshot whenever a test fails.

> Important! If the `screenshots` function is not called, TestCafe does not take screenshots.

**Example**

```js
runner.screenshots('reports/screenshots/', true);
```

### reporter

Configures the TestCafe reporting feature.

```text
reporter(name [, outStream]) → this
```

Parameter                | Type                        | Description                                     | Default
------------------------ | --------------------------- | ----------------------------------------------- | --------
`name`                   | String                      | The name of the [reporter](../common-concepts/reporters.md) to use.
`outStream`&#160;*(optional)* | Writable Stream implementer | The stream to which the report will be written. | `stdout`

To use multiple reporters, call this method several times with different reporter names. Note that only one reporter can write to `stdout`.

#### Specifying the Reporter

```js
runner.reporter('minimal');
```

#### Saving the Report to a File

```js
const stream = fs.createWriteStream('report.xml');

runner
    .src('tests/sample-fixture.js')
    .browsers('chrome')
    .reporter('xunit', stream)
    .run()
    .then(failedCount => {
        stream.end();
    });
```

#### Using Multiple Reporters

```js
const stream = fs.createWriteStream('report.json');

runner
    .src('tests/sample-fixture.js')
    .browsers('chrome')
    .reporter('json', stream)
    .reporter('list')
    .run()
    .then(failedCount => {
        stream.end();
    });
```

#### Implementing a Custom Stream

```js
class MyStream extends stream.Writable {
    _write(chunk, encoding, next) {
        doSomething(chunk);
        next();
    }
}

const stream = new MyStream();
runner.reporter('json', stream);
```

You can also build your own reporter. Use a [dedicated Yeoman generator](https://github.com/DevExpress/generator-testcafe-reporter) to scaffold out a [reporter plugin](../../extending-testcafe/reporter-plugin/README.md).

### concurrency

Specifies that tests should run concurrently.

```text
concurrency(n) → this
```

TestCafe will open `n` instances of the same browser thus creating a pool of browser instances.
Tests will run concurrently against this pool, i.e. each test will run in the first free instance.

The `concurrency` function takes the following parameters.

Parameter | Type    | Description
--------- | ------- | --------
`n`  | Number | The number of browser instances that will be invoked.

To learn more about concurrent test execution, see [Concurrent Test Execution](../common-concepts/concurrent-test-execution.md).

The following example shows how to run tests in three Chrome instances.

```js
runner
    .browsers('chrome')
    .concurrency(3);
```

### startApp

Specifies a shell command that will be executed before running tests. Use it to launch or deploy the application that will be tested.

```text
async startApp(command, initDelay) → this
```

After the testing is finished, the appication will be automatically terminated.

The `startApp` function takes the following parameters.

Parameter         | Type    | Description   Default
----------------- | ------- | -------- | -------
`command`                     | String | The shell command to be executed.
`initDelay`&#160;*(optional)* | Number | The amount of time, in milliseconds, allowed for the command to initialize the tested application. | `1000`

> TestCafe adds `node_modules/.bin` to `PATH` so that you can use binaries provided by locally installed dependencies without prefixes.

**Example**

```js
runner.startApp('node server.js', 4000);
```

### useProxy

Specifies the proxy server used in your local network to access the Internet.

```text
async useProxy(host) → this
```

Parameter | Type   | Description
--------- | ------ | ---------------------
`host`    | String | The proxy server host.

**Examples**

```js
runner.useProxy('proxy.corp.mycompany.com');
```

```js
runner.useProxy('172.0.10.10:8080');
```

You can also specify authentication credentials with the proxy host.

```js
runner.useProxy('username:password@proxy.mycorp.com');
```

### run

Runs tests according to the current configuration. Returns the number of failed tests.

```text
async run(options) → Promise<Number>
```

> Important! Make sure to keep the browser tab that is running tests active. Do not minimize the browser window.
> Inactive tabs and minimized browser windows switch to a lower resource consumption mode
> where tests are not guaranteed to execute correctly.

You can pass the following options to the `runner.run` function.

Parameter         | Type    | Description                                                                                                                                                                           | Default
----------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------
`skipJsErrors`    | Boolean | Defines whether to continue running a test after a JavaScript error occurs on a page (`true`), or consider such a test failed (`false`).                                              | `false`
`quarantineMode`  | Boolean | Defines whether to enable the [quarantine mode](#quarantine-mode).                                                                                                                    | `false`
`selectorTimeout` | Number  | Specifies the amount of time, in milliseconds, within which [selectors](../../test-api/selecting-page-elements/selectors/README.md) make attempts to obtain a node to be returned. See [Selector Timeout](../../test-api/selecting-page-elements/selectors/using-selectors.md#selector-timeout). | `10000`
`assertionTimeout` | Number  | Specifies the amount of time, in milliseconds, within which TestCafe makes attempts  to successfully execute an [assertion](../../test-api/assertions/README.md) if [a selector property](../../test-api/selecting-page-elements/selectors/using-selectors.md#define-assertion-actual-value) or a [client function](../../test-api/obtaining-data-from-the-client/README.md) was passed as an actual value. See [Smart Assertion Query Mechanism](../../test-api/assertions/README.md#smart-assertion-query-mechanism). | `3000`
`pageLoadTimeout` | Number  | Specifies the amount of time, in milliseconds, passed after the `DOMContentLoaded` event, within which TestCafe waits for the `window.load` event to fire. After the timeout passes or the `window.load` event is raised (whichever happens first), TestCafe starts the test. You can set this timeout to `0` to skip waiting for `window.load`. | `3000`
`speed`           | Number  | Specifies the speed of test execution. Should be a number between `1` (the fastest) and `0.01` (the slowest). If speed is also specified for an [individual action](../../test-api/actions/action-options.md#basic-action-options), the action speed setting overrides test speed. | `1`
`debugMode`       | Boolean | Specifies if tests run in the debug mode. If this option is enabled, test execution is paused before the first action or assertion allowing you to invoke the developer tools and debug. In the debug mode, you can execute the test step-by-step to reproduce its incorrect behavior. You can also use the **Unlock page** switch in the footer to unlock the tested page and interact with its elements. | `false`
`debugOnFail`     | Boolean | Specifies whether to enter the debug mode when a test fails. If enabled, the test is paused at the moment it fails, so that you can explore the tested page to determine the cause of the fail. | `false`

After all tests are finished, call the [testcafe.close](testcafe.md#close) function to stop the TestCafe server.

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
            speed: 0.1
        });
    })
    .then(failed => {
        console.log('Tests failed: ' + failed);
        testcafe.close();
    })
    .catch(error => { /* ... */ });
```

#### Cancelling Test Tasks

You can stop an individual test task at any moment by cancelling the corresponding promise.

```js
const taskPromise = runner
    .src('tests/fixture1.js')
    .browsers([remoteConnection, 'chrome'])
    .reporter('json')
    .run();

taskPromise.cancel();
```

You can also cancel all pending tasks at once by using the [runner.stop](#stop) function.

#### Quarantine Mode

The quarantine mode is designed to isolate *non-deterministic* tests (i.e., tests that sometimes pass and sometimes fail without a clear reason)
from the rest of the test base (*healthy* tests).

When the quarantine mode is enabled, tests are not marked as *failed* after the first unsuccessful run but rather sent to quarantine.
After that, these tests are run several more times. The outcome of the most runs (*passed* or *failed*) is recorded as the test result.
A test is separately marked *unstable* if the outcome varies between runs. The run that led to quarantining the test counts.

To learn more about the issue of non-deterministic tests, see Martin Fowler's [Eradicating Non-Determinism in Tests](http://martinfowler.com/articles/nonDeterminism.html) article.

### stop

Stops all pending test tasks.

```text
async stop()
```

You can also stop an individual pending task by [cancelling the corresponding promise](#cancelling-test-tasks).
