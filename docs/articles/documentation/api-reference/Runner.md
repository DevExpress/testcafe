---
layout: docs
title: Runner Class
permalink: /documentation/api-reference/Runner/
---
# Runner Class

An object that configures and launches test runs.

Created by the [testCafe.createRunner](/testcafe/documentation/api-reference/TestCafe/#createRunner) function.

#### Example

```js
var createTestCafe = require('testcafe');
var testCafe = await createTestCafe('localhost', 1337, 1338);

testCafe
    .createRunner()
    .src(['/tests/fixture1.js', '/tests/func/fixture3.js'])
    .browsers(['chrome', 'firefox'])
    .run()
    .then(failed => console.log('Tests failed: ' + failed));
```

## Functions

### <a class="anchor" name="src"></a>src(source) → this

### src([source, ...]) → this

Configures the test runner to run tests from the specified files.

Parameter | Type   | Description
--------- | ------ | -----------------------------------------------------
`source`  | String | The relative or absolute path to a test fixture file.

Concatenates the settings when called several times.

#### Example

```js
runner.src(['/home/user/tests/fixture1.js', '../fixture5.js']);
```

### <a class="anchor" name="filter"></a>filter(callback) → this

Allows you to manualy select which tests should be run.

Parameter  | Type                                         | Description
---------- | -------------------------------------------- | ----------------------------------------------------------------
`callback` | function(testName, fixtureName, fixturePath) | The callback that determines if a particular test should be run.

The callback function is called for each test in the fixtures specified by the [src](#src) function.

Return `true` to include the current test, or `false` otherwise.

Parameter     | Type   | Description
------------- | ------ | ----------------------------------
`testName`    | String | The name of the test.
`fixtureName` | String | The name of the test fixture.
`fixturePath` | String | The path to the test fixture file.

#### Example

```js
runner.filter(function(testName, fixtureName, fixturePath) {
    return fixturePath.startsWith('D') &&
        testName.match(someRe) &&
        fixtureName.match(anotherRe);
});
```

### <a class="anchor" name="browsers"></a>browsers(browser) → this

### browsers([browser, ...]) → this

Configures the test runner to run tests in the specified browsers.

Each `browser` parameter can be one of the following.

Type                                                                                       | Description                                                                                    | Local/Remote
------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- | --------------
String                                                                                     | The browser alias: `"ie"`, `"ff"`, `"chrome"`, `"chromium"`, `"opera"`, `"safari"` or `"edge"` | Local browser
String                                                                                     | The path to the browser executable.                                                            | Local browser
`{path: String, cmd: String}`                                                              | The path to the browser executable (`path`) with command line parameters (`cmd`).              | Local browser
[BrowserConnection](/testcafe/documentation/api-reference/BrowserConnection/)              | The remote browser connection.                                                                 | Remote browser

You are free to mix different types of objects in one function call. The `browsers` function concatenates the settings when called several times.

#### Examples

##### Using browser aliases

```js
runner.browsers(["firefox", "chrome"]);
```

##### Using the path to the browser executable

```js
runner.browsers("C:\\Program Files\\Internet Explorer\\iexplore.exe");
```

##### The path to the browser executable with command line parameters

```js
runner.browsers({
    path: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    cmd: "--new-window"
});
```

##### The remote browser connection

```js
var createTestCafe = require('testcafe');
var testCafe = await createTestCafe('localhost', 1337, 1338);

var remoteConnection = testcafe.createBrowserConnection();

console.log(remoteConnection.url);
remoteConnection.on('ready', () => {
    await testCafe
        .createRunner()
        .browsers(remoteConnection)
        .run();
});
```

### <a class="anchor" name="screenshots"></a>screenshots(path [, takeOnFails]) → this

Enables the test runner to take screenshots of the tested webpages.

Parameter                  | Type    | Description                                                                   | Default
-------------------------- | ------- | ----------------------------------------------------------------------------- | -------
`path`                     | String  | The path to which the screenshots will be saved.
`takeOnFails` *(optional)* | Boolean | Specifies if screenshots should be taken automatically whenever a test fails. | `false`

The `screenshots` function must be called in order to enable TestCafe to take screenshots whenever the `screenshot` action is called from test code.
If the `screenshots` function is not called, the `screenshot` action is ignored.

The `takeOnFails` parameter handles a separate scenario of capturing the webpage. Set it to `true` to make TestCafe take a screenshot whenever a test fails.

#### Example

```js
runner.screenshots('/home/user/screenshots/', true);
```

### <a class="anchor" name="reporter"></a>reporter(name, outStream]) → this

Configures the test runner's reporting feature.

Parameter                | Type                        | Description                                     | Default
------------------------ | --------------------------- | ----------------------------------------------- | --------
`name`                   | String                      | The name of the reporter to use.
`outStream` *(optional)* | Writable Stream implementer | The stream to which the report will be written. | `stdout`

Reporters are plugins used to output test run reports in a certain format.

TestCafe ships with the following reporters:

* [spec](https://github.com/DevExpress/testcafe-reporter-spec) - used by default,
* [list](https://github.com/DevExpress/testcafe-reporter-list),
* [minimal](https://github.com/DevExpress/testcafe-reporter-minimal),
* [xUnit](https://github.com/DevExpress/testcafe-reporter-xunit),
* [JSON](https://github.com/DevExpress/testcafe-reporter-json).

#### Examples

##### Specifying the reporter

```js
runner.reporter("minimal");
```

##### Saving the report to a file

```js
var stream = fs.createWriteStream('./report.xml');

runner
    .reporter("xunit", stream)
    .run()
    .then(() => stream.end());
```

##### Handle the report programmatically

```js
runner.reporter("json", {
    write: (chunk, encoding, next) => {
        doSomething(chunk);
        next();
    }
});
```

You can also build your own reporter. Use a [dedicated Yeoman generator](https://github.com/DevExpress/generator-testcafe-reporter) to scaffold out a custom reporter plugin.

### <a class="anchor" name="run"></a>run(options) → Promise\<Number\>

Runs tests according to the current configuration. Returns the number of failed tests.

You can pass the following options to this function.

Parameter                | Type    | Description                                                                                                                                                                                            | Default
------------------------ | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------
`options.skipJsErrors`   | Boolean | Defines whether to continue running a test after a JavaScript error occurs on a page (`true`), or consider such a test failed (`false`).                                                               | `false`
`options.quarantineMode` | Boolean | Defines whether to mark a test failed after the first unsuccessful run (`false`), or send it to the quarantine where it will be run again several times and classified as failed or unstable (`true`). | `false`

#### Example

```js
runner
    .run({
        skipJsErrors: true,
        quarantineMode: true
    })
    .then(failed => console.log('Tests failed: ' + failed));
```