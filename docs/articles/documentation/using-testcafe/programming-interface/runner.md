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
const testCafe       = await createTestCafe('localhost', 1337, 1338);

const failed = await testCafe
    .createRunner()
    .src(['tests/fixture1.js', 'tests/func/fixture3.js'])
    .browsers(['chrome', 'safari'])
    .run();

console.log('Tests failed: ' + failed);
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
    * [Implementing a Custom Stream](#implementing-a-custom-stream)
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
String                                                                                                | The browser alias that differs for different browser types. For details, see [Browser Support](../common-concepts/browser-support.md).                            | [Local browsers](../common-concepts/browser-support.md#locally-installed-browsers), [cloud browsers](../common-concepts/browser-support.md#browsers-in-cloud-testing-services) and [browsers accessed through *browser provider plugins*](../common-concepts/browser-support.md#nonconventional-browsers).                                                                 |
 `{path: String, cmd: String}`                                                                        | The path to the browser executable (`path`) and command line parameters (`cmd`). The `cmd` property is optional.                                                     | [Local](../common-concepts/browser-support.md#locally-installed-browsers) and [portable](../common-concepts/browser-support.md#portable-browsers) browsers
[BrowserConnection](browserconnection.md)                                                            | The remote browser connection.                                                                                                                                        | [Remote browsers](../common-concepts/browser-support.md#browsers-on-remote-devices)

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

#### Specifying the Path to the Browser Executable

```js
runner.browsers('C:\\Program Files\\Internet Explorer\\iexplore.exe');
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
const createTestCafe   = require('testcafe');
const testCafe         = await createTestCafe('localhost', 1337, 1338);

const remoteConnection = await testcafe.createBrowserConnection();

// Outputs remoteConnection.url to visit it from the remote browser.
console.log(remoteConnection.url);

remoteConnection.once('ready', async () => {
    await testCafe
        .createRunner()
        .browsers(remoteConnection)
        .run();
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

The screenshot functionality is not yet available on Linux. See the corresponding [issue on GitHub](https://github.com/DevExpress/testcafe-browser-natives/issues/12).

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

#### Specifying the Reporter

```js
runner.reporter('minimal');
```

#### Saving the Report to a File

```js
const stream = fs.createWriteStream('report.xml');

await runner
    .reporter('xunit', stream)
    .run();

stream.end();
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

You can also build your own reporter. Use a [dedicated Yeoman generator](https://github.com/DevExpress/generator-testcafe-reporter) to scaffold out a [reporter plugin](../../extending-testcafe/reporter-plugin/index.md).

### run

Runs tests according to the current configuration. Returns the number of failed tests.

```text
async run(options) → Promise<Number>
```

> Important! Make sure to keep the browser tab that is running tests active. Do not minimize the browser window.
> Inactive tabs and minimized browser windows switch to a lower resource consumption mode
> where tests are not guaranteed to execute correctly.

You can pass the following options to this function.

Parameter         | Type    | Description                                                                                                                                                                           | Default
----------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------
`skipJsErrors`    | Boolean | Defines whether to continue running a test after a JavaScript error occurs on a page (`true`), or consider such a test failed (`false`).                                              | `false`
`quarantineMode`  | Boolean | Defines whether to enable the [quarantine mode](#quarantine-mode).                                                                                                                    | `false`
`selectorTimeout` | Number  | Specifies the amount of time, in milliseconds, within which [selectors](../../test-api/selecting-page-elements/selectors.md) make attempts to obtain a node to be returned. See [Selector Timeout](../../test-api/selecting-page-elements/selectors.md#selector-timeout). | `10000`
`assertionTimeout` | Number  | Specifies the amount of time, in milliseconds, within which TestCafe makes attempts  to successfully execute an [assertion](../../test-api/assertions/index.md) if [a selector property](../../test-api/selecting-page-elements/selectors.md#define-assertion-actual-value) was used. See [Smart Assertion Query Mechanism](../../test-api/assertions/index.md#smart-assertion-query-mechanism). | `3000`
`touchMode`       | Boolean | Defines whether to enable the simulation of touch events instead of mouse events for touch monitors. This option has no effect for touch mobile devices.                              | `false`
`speed`           | Number  | Specifies the speed of test execution. Should be a number between `1` (the fastest) and `0.01` (the slowest). | `1`

**Example**

```js
const failed = await runner.run({
    skipJsErrors: true,
    quarantineMode: true,
    selectorTimeout: 50000,
    assertionTimeout: 7000,
    speed: 0.1
})

console.log('Tests failed: ' + failed);
```

#### Cancelling Test Tasks

You can stop an individual test task at any moment by cancelling the corresponding promise.

```js
const taskPromise = runner
    .src('tests/fixture1.js')
    .browsers([remoteConnection, 'chrome'])
    .reporter('json')
    .run();

await taskPromise.cancel();
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
