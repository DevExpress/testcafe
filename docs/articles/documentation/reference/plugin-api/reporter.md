---
layout: docs
title: Reporter Interface
permalink: /documentation/reference/plugin-api/reporter.html
redirect_from:
  - /documentation/extending-testcafe/reporter-plugin/reporter-methods.html
  - /documentation/extending-testcafe/reporter-plugin/helpers.html
---
# Reporter Interface

Implement the following methods to [create a reporter](../../guides/extend-testcafe/reporter-plugin.md#implement-the-reporter):

* [reportTaskStart](#reporttaskstart)
* [reportFixtureStart](#reportfixturestart)
* [reportTestDone](#reporttestdone)
* [reportTaskDone](#reporttaskdone)
* [reportTestStart](#reportteststart) *(optional)*

You can use the [helper methods and libraries](#helper-methods) within the reporter methods to output the required data.

* [Output Helpers](#output-helpers)
* [Formatting Helpers](#formatting-helpers)
* [Coloring Helper](#coloring-helper)
* [Date-Time Helper](#datetime-helper)

## reportTaskStart

Fires when a test task starts.

```text
async reportTaskStart (startTime, userAgents, testCount)
```

Parameter    | Type             | Description
------------ | ---------------- | ---------------------------------------
`startTime`  | Date             | The date and time when testing started.
`userAgents` | Array of Strings | The list of browsers used for testing. Contains the formatted names and versions of the browsers and operating systems.
`testCount`  | Number           | The total number of tests to run.

**Example**

```js
async reportTaskStart (startTime, userAgents, testCount) {
    this.startTime = startTime;
    this.testCount = testCount;

    const time = this.moment(startTime).format('M/D/YYYY h:mm:ss a');

    this.write(`Testing started: ${time}`)
        .newline()
        .write(`Running ${testCount} tests in: ${userAgents}`)
        .newline();
}

//=> Testing started: 8/12/2016 3:00:00 am
//=> Running 6 tests in: Chrome 41.0.2227 / Mac OS X 10.10.1,Firefox 47 / Mac OS X 10.10.1
```

## reportFixtureStart

Fires each time a fixture starts.

```text
async reportFixtureStart (name, path, meta)
```

Parameter | Type   | Description
--------- | ------ | --------------------------------
`name`    | String | The test fixture name.
`path`    | String | The path to a test fixture file.
`meta`    | Object | The fixture metadata. See [Specify Test Metadata](../../guides/basic-guides/organize-tests.md#specify-test-metadata) for more information.

**Example**

```js
async reportFixtureStart (name, path, meta) {
    this.currentFixtureName = name;
    this.currentFixtureMeta = meta;
    this.write(`Starting fixture: ${name} ${meta.fixtureID}`)
        .newline();
}

//=> Starting fixture: First fixture f-0001
```

## reportTestStart

Fires each time a test starts. This method is *optional*.

```text
async reportTestStart (name, meta)
```

Parameter | Type   | Description
--------- | ------ | --------------------------------
`name`    | String | The test name.
`meta`    | Object | The test metadata. See [Specify Testing Metadata](../../guides/basic-guides/organize-tests.md#specify-test-metadata) for more information.

**Example**

```js
async reportTestStart (name, meta) {
    this.write(`Starting test: ${name} (${meta.severity})`)
        .newline();
}

//=> Starting test: Submit data (minor)
```

## reportTestDone

Fires each time a test ends.

```text
async reportTestDone (name, testRunInfo, meta)
```

Parameter     | Type   | Description
------------- | ------ | -------------------------------------------------------------
`name`        | String | The test name.
`testRunInfo` | Object | The [testRunInfo](#testruninfo-object) object.
`meta`        | Object | The test metadata. See [Specify Testing Metadata](../../guides/basic-guides/organize-tests.md#specify-test-metadata) for more information.

**Example**

```js
async reportTestDone (name, testRunInfo, meta) {
    const hasErr      = !!testRunInfo.errs.length;
    const hasWarnings = !!testRunInfo.warnings.length;
    const result      = testRunInfo.skipped ? 'skipped' : hasErr ? `passed` : `failed`;

    name = `${this.currentFixtureName} - ${name}`;

    let title = `${result} ${name}`;

    if (testRunInfo.unstable)
        title += ' (unstable)';

    if (testRunInfo.screenshotPath)
        title += ` (screenshots: ${testRunInfo.screenshotPath})`;

    if (meta.severity)
        title += ` (${meta.severity})`;

    if (hasWarnings)
        title += ' (with warnings)';

    this.write(title)
        .newline();
}

//=> failed First fixture - First test in first fixture (unstable) (screenshots: /screenshots/1445437598847) (critical)
//=> passed First fixture - Second test in first fixture (screenshots: /screenshots/1445437598847)
//=> failed First fixture - Third test in first fixture
//=> skipped First fixture - Fourth test in first fixture
```

### testRunInfo Object

The `testRunInfo` object provides detailed information about the test run. The object has the following properties:

Property            | Type             | Description
------------------- | ---------------- | --------------------------------------------------------
`errs`              | Array of Objects | An array of errors that occurred during the test run. Use the [formatError](#formaterror) helper to convert objects in this array to strings.
`warnings`          | Array of Strings | An array of warnings that appeared during the test run.
`durationMs`        | Number           | The duration of the test (in milliseconds).
`unstable`          | Boolean          | Specifies if the test is marked as unstable.
`screenshotPath`    | String           | The path where screenshots are saved.
`screenshots`       | Array of Objects | An array of [screenshot](#screenshots-object) objects.
`quarantine`        | Object           | A [quarantine](#quarantine-object) object.
`skipped`           | Boolean          | Specifies if the test was skipped.

### screenshots Object

The `screenshot` object provides information about the screenshot captured during the test run. The object has the following properties:

Property            | Type             | Description
------------------- | ---------------- | --------------------------------------------------------
`screenshotPath`    | String           | The path where the screenshot was saved.
`thumbnailPath`     | String           | The path where the screenshot's thumbnail was saved.
`userAgent`         | String           | The user agent string of the browser where the screenshot was captured.
`quarantineAttempt` | Number           | The [quarantine](../../guides/basic-guides/run-tests.md#quarantine-mode) attempt's number.
`takenOnFail`       | Boolean          | Specifies if the screenshot was captured when the test failed.

### quarantine Object

The `quarantine` object provides information about [quarantine](../../guides/basic-guides/run-tests.md#quarantine-mode)'s attempts in the form of key-value pairs.

Key                               | Value
----------------------------------| ------------------------------------------------
The&nbsp;quarantine&nbsp;attempt's&nbsp;number. |  The object that provides information about the attempt. The object has the boolean `passed` property that specifies if the test passed in the current attempt.

## reportTaskDone

Fires when the task ends.

```text
async reportTaskDone (endTime, passed, warnings, result)
```

Parameter  | Type             | Description
---------- | ---------------- | ----------------------------------------------
`endTime`  | Date             | The date and time when testing completed.
`passed`   | Number           | The number of passed tests.
`warnings` | Array of Strings | An array of warnings that occurred during a task run.
`result`   | Object           | Contains information about the task results.

**Example**

```js
async reportTaskDone (endTime, passed, warnings, result) {
    const time = this.moment(endTime).format('M/D/YYYY h:mm:ss a');
    const durationMs  = endTime - this.startTime;
    const durationStr = this.moment.duration(durationMs).format('h[h] mm[m] ss[s]');
    const summary = result.failedCount ?
                    `${result.failedCount}/${this.testCount} failed` :
                    `${result.passedCount} passed`;

    this.write(`Testing finished: ${time}`)
        .newline()
        .write(`Duration: ${durationStr}`)
        .newline()
        .write(result)
        .newline();
}

//=> Testing finished: 8/12/2016 3:15:25 am
//=> Duration: 15m 25s
//=> 2/6 failed
```

### result Object

The `result` object contains information about the task results. The object has the following properties:

Parameter      | Type   | Description
-------------- | ------ | ----------------------------------------------
`passedCount`  | Number | The number of passed tests.
`failedCount`  | Number | The number of failed tests.
`skippedCount` | Number | The number of skipped tests.

## Helper Methods

Helpers are methods and libraries used to format report output when [implementing a reporter](../../guides/extend-testcafe/reporter-plugin.md#implement-the-reporter). TestCafe mixes these methods into the reporter.

To access helpers, use `this`.

### Output Helpers

All output helper methods are chainable: each method returns `this` so that the methods can be executed one right after another.
This allows you to write compact code like this.

```js
this.setIndent(4)
    .write(testname)
    .newline()
    .write(result);
```

#### newline

Adds a new line to the report.

```text
newline () → this
```

**Example**

```js
async reportTaskDone (endTime, passed, warnings, result) {
    ...
    const summary = result.failedCount ?
                    `${result.failedCount}/${this.testCount} failed` :
                    `${result.passedCount} passed`;

    this.newline()
        .write(summary)
        .newline();
}
```

#### write

Writes the specified text to the report.

```text
write (text) → this
```

Parameter | Type   | Description
--------- | ------ | ---------------------------------
`text`    | String | The text to output in the report.

**Example**

```js
async reportTaskDone (endTime, passed, warnings, result) {
    ...
    const summary = result.failedCount ?
                    `${result.failedCount}/${this.testCount} failed` :
                    `${result.passedCount} passed`;

    this.write(summary)
        .newline();
}
```

#### useWordWrap

Toggles word wrapping for subsequent output.

```text
useWordWrap (use) → this
```

Parameter | Type    | Description
--------- | ------- | ---------------------------------------
`use`     | Boolean | Specify *true* to enable word wrapping.

**Example**

The following example demonstrates how to enable word wrapping when the `title` string is long:

```js
async reportTestDone (name, testRunInfo, meta) {
    ...
    name = `${this.currentFixtureName} - ${name}`;

    const title = `${result} ${name}`;

    this.useWordWrap(true)
        .write(title);
}
```

#### setIndent

Specifies indentation for subsequent output.

```text
setIndent (val) → this
```

Parameter | Type    | Description
--------- | ------- | ----------------------------------------------------------------------------------------------------
`val`     | Integer | Specifies the number of spaces to indent a new line. To disable indentation, set the parameter to 0.

**Example**

The following example demonstrates how to indent summary information by four spaces:

```js
async reportTaskDone (endTime, passed, warnings, result) {
    ...
    const summary = result.failedCount ?
                    `${result.failedCount}/${this.testCount} failed` :
                    `${result.passedCount} passed`;

    this.setIndent(4)
        .write(summary);
}
//=>    2/6 failed
```

### Formatting Helpers

#### indentString

Indents each line in a string by a number of spaces.

```text
indentString (str, indentVal) → String
```

Parameter   | Type   | Description
----------- | ------ | ------------------------------------------
`str`       | String | The string to indent.
`indentVal` | Number | The number of spaces to indent a new line.

**Example**

This example demonstrates how to indent each line in the `str` string by four spaces.

```js
async reportTaskStart (startTime, userAgents, testCount) {
    let str = `Start running tests\nBrowsers used for testing: ${userAgents}`;
    str = this.indentString(str, 4);

    this.write(`${str}`)
}
//=>    Start running tests
//=>    Browsers used for testing: Chrome,Firefox
```

#### wordWrap

Breaks and wraps a string to a new line if its length exceeds the maximum allowed length.

```text
wordWrap (str, indentVal, width) → String
```

Parameter   | Type   | Description
----------- | ------ | -------------------------------------------------------
`str`       | String | The string you want to break.
`indentVal` | Number | The number of spaces to indent a new line.
`width`     | Number | The maximum number of characters each line can contain.

**Example**

The following example demonstrates how to break the `title` string to the next line if the string length is more than 50 symbols.

```js
const LINE_WIDTH = 50;

async reportTestDone (name, testRunInfo, meta) {
    const hasErr    = !!testRunInfo.errs.length;
    const result    = hasErr ? `passed` : `failed`;

    name = `${this.currentFixtureName} - ${name}`;

    let title = `${result} ${name}`;

    title = this.wordWrap(title, 2, LINE_WIDTH);

    this.write(title)
        .newline()
        .newline();
}
//=>  failed Sample fixture - Comparing the input
//=>  value with the specified one
//=>
//=>  passed Sample fixture - Clicking an array of
//=>  labels and checking their states
```

#### escapeHtml

Encodes a string for use in HTML.

```text
escapeHtml (str) → String
```

Parameter   | Type   | Description
----------- | ------ | ------------------------------
`str`       | String | The string to be encoded.

**Example**

The following example demonstrates how to encode the fixture name *Tests for the "Example" page* for HTML

```js
async reportFixtureStart (name, path, meta) {
    this.currentFixtureName = this.escapeHtml(name);
    this.write(this.currentFixtureName);
}
//=>Tests for the &quot;Example&quot; page
```

#### formatError

Returns the formatted error message string for the specified error.

```text
formatError (err, prefix = '') → String
```

Parameter     | Type   | Description
------------- | ------ | -------------------------------------------------------------------
`err`         | Object | The error object you need to format.
`prefix = ''` | String | The string that is prepended to the error. By default, it is empty.

**Example**

The following example demonstrates how to number errors:

```js
async reportTestDone (name, testRunInfo, meta) {
    ...
    const hasErr = !!testRunInfo.errs.length;

    if (hasErr) {
        errs.forEach((err, idx) => {
            this.newline()
                .write(this.formatError(err, `${idx + 1}) `));
        });
    }
}
//=> 1) Chrome
//=>    Assertion failed at step "Step1"
//=>    ...
//=> 2) Firefox
//=>    Assertion failed at step "Step1"
//=>    ...
```

### Coloring Helper

#### chalk

[chalk](https://github.com/chalk/chalk) is used for ANSI-coloring of the text.

```text
chalk.<style>[.<style>...](string, [string...]) → this
```

**Example**

The following example demonstrates how to color test results:

```js
async reportTestDone (name, testRunInfo, meta) {
    const hasErr = !!testRunInfo.errs.length;
    const result = hasErr ? this.chalk.green(`passed`) : this.chalk.red(`failed`);

    name = `${this.currentFixtureName} - ${name}`;

    const title = `${result} ${name}`;

    this.write(title);
}
```

To force disabling coloring in reports, set the reporter's `noColors` property in the `src/index.js` file to `false`.
For example, you may need to disable coloring for machine-readable formats (JSON or xUnit) since the colored output is not required.

```js
export default function () {
    return {
        noColors: true,

        async reportTaskStart (startTime, userAgents, testCount) {
            ...
        },

        ...
    };
}
```

### Date/Time Helper

#### moment

[moment](http://momentjs.com/) is used to deal with dates and time.

```text
moment().format() → this
```

**Example**

```js
async reportTaskDone (endTime, passed, warnings, result) {
    const durationMs  = endTime - this.startTime;
    const durationStr = this.moment
                            .duration(durationMs)
                            .format('h[h] mm[m] ss[s]');

    this.write(`Duration: ${durationStr}`)
    ...
}
```
