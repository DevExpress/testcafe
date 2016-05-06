---
layout: docs
title: Runner Class
permalink: /documentation/using-testcafe/programming-interface/runner.html
---
# Runner Class

An object that configures and launches test runs.

Created by the [testCafe.createRunner](testcafe.md#createRunner) function.

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

### src

Configures the test runner to run tests from the specified files.

```text
src(source) → this
src([source, ...]) → this
```

Parameter | Type   | Description
--------- | ------ | -----------------------------------------------------
`source`  | String | The relative or absolute path to a test fixture file.

Concatenates the settings when called several times.

**Example**

```js
runner.src(['/home/user/tests/fixture1.js', 'fixture5.js']);
```

### filter

Allows you to manualy select which tests should be run.

```text
filter(callback) → this
```

Parameter  | Type                                           | Description
---------- | ---------------------------------------------- | ----------------------------------------------------------------
`callback` | `function(testName, fixtureName, fixturePath)` | The callback that determines if a particular test should be run.

The callback function is called for each test in the files selected by the [src](#src) method.

Return `true` to include the current test, or `false` otherwise.

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
browsers([browser, ...]) → this
```

Each `browser` parameter can be one of the following.

Type                                                                                                 | Description                                                                                                                                                           | Local/Remote
---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------
String                                                                                               | The browser's short name - *alias*. Find the list of aliases in the [Browser Aliases](../common-concepts/browser-aliases.md) topic.                                   | Local browser
String                                                                                               | The path to the browser executable.                                                                                                                                   | Local browser
`{path: String, cmd: String}`                                                                        | The path to the browser executable (`path`) with command line parameters (`cmd`).                                                                                     | Local browser
[BrowserConnection](browserconnection.md)                                                            | The remote browser connection.                                                                                                                                        | Remote browser

You are free to mix different types of objects in one function call. The `browsers` function concatenates the settings when called several times.

#### Using browser aliases

```js
runner.browsers(['safari', 'chrome']);
```

#### Specifying the path to the browser executable

```js
runner.browsers('C:\\Program Files\\Internet Explorer\\iexplore.exe');
```

#### Specifying the path with command line parameters

```js
runner.browsers({
    path: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    cmd: '--new-window'
});
```

#### Passing the remote browser connection

```js
const createTestCafe   = require('testcafe');
const testCafe         = await createTestCafe('localhost', 1337, 1338);

const remoteConnection = testcafe.createBrowserConnection();

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

Enables the test runner to take screenshots of the tested webpages.

```text
screenshots(path [, takeOnFails]) → this
```

Parameter                  | Type    | Description                                                                   | Default
-------------------------- | ------- | ----------------------------------------------------------------------------- | -------
`path`                     | String  | The path to which the screenshots will be saved.
`takeOnFails` *(optional)* | Boolean | Specifies if screenshots should be taken automatically whenever a test fails. | `false`

The `screenshots` function must be called in order to enable TestCafe to take screenshots whenever the `screenshot` action is called from test code.
If the `screenshots` function is not called, the `screenshot` action is ignored.

The `takeOnFails` parameter handles a separate scenario of capturing the webpage. Set it to `true` to make TestCafe take a screenshot whenever a test fails.

**Example**

```js
runner.screenshots('reports/screenshots/', true);
```

### reporter

Configures the test runner's reporting feature.

```text
reporter(name [, outStream]) → this
```

Parameter                | Type                        | Description                                     | Default
------------------------ | --------------------------- | ----------------------------------------------- | --------
`name`                   | String                      | The name of the [reporter](../common-concepts/reporters.md) to use.
`outStream` *(optional)* | Writable Stream implementer | The stream to which the report will be written. | `stdout`

#### Specifying the reporter

```js
runner.reporter('minimal');
```

#### Saving the report to a file

```js
const stream = fs.createWriteStream('report.xml');

await runner
    .reporter('xunit', stream)
    .run();

stream.end();
```

#### Implementing a custom stream

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

You can also build your own reporter. Use a [dedicated Yeoman generator](https://github.com/DevExpress/generator-testcafe-reporter) to scaffold out a [custom reporter plugin](../../extending-testcafe/custom-reporter-plugin/index.md).

### run

Runs tests according to the current configuration. Returns the number of failed tests.

```text
run(options) → Promise<Number>
```

You can pass the following options to this function.

Parameter                | Type    | Description                                                                                                                                                                                            | Default
------------------------ | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------
`options.skipJsErrors`   | Boolean | Defines whether to continue running a test after a JavaScript error occurs on a page (`true`), or consider such a test failed (`false`).                                                               | `false`
`options.quarantineMode` | Boolean | Defines whether to enable the *quarantine mode* (see below).                                                                                                                                             | `false`

#### Quarantine Mode

The quarantine mode is designed to isolate non-deterministic tests (i.e., tests that sometimes pass and sometimes fail without a clear reason)
from the rest of the test base (healthy tests).

When the quarantine mode is enabled, tests are not marked as *failed* after the first unsuccessful run but rather sent to the quarantine.
After that, these tests are run several more times. The outcome of the most runs (*passed* or *failed*) is recorded as the test result.
A test is separately marked *unstable* if the outcome varies between runs. The run that led to quarantining the test counts.

To learn more about the issue of non-deterministic tests, see Martin Fowler's [Eradicating Non-Determinism in Tests](http://martinfowler.com/articles/nonDeterminism.html) article.

**Example**

```js
const failed = await runner.run({
    skipJsErrors: true,
    quarantineMode: true
})

console.log('Tests failed: ' + failed);
```