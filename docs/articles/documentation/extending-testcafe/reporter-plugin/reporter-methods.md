---
layout: docs
title: Reporter Methods
permalink: /documentation/extending-testcafe/reporter-plugin/reporter-methods.html
checked: false
---
# Reporter Methods

You should implement the following methods to create a [reporter](README.md#implementing-the-reporter):

* [reportTaskStart](#reporttaskstart)
* [reportFixtureStart](#reportfixturestart)
* [reportTestDone](#reporttestdone)
* [reportTaskDone](#reporttaskdone)

> You can use the [helper methods and libraries](helpers.md) within the reporter methods to output the required data.

## reportTaskStart

Fires when a test task starts.

```text
reportTaskStart (startTime, userAgents, testCount)
```

Parameter    | Type             | Description
------------ | ---------------- | ---------------------------------------
`startTime`  | Date             | The date and time when testing started.
`userAgents` | Array of Strings | The list of browsers used for testing.
`testCount`  | Number           | The total number of tests to run.

**Example**

```js
reportTaskStart (startTime, userAgents, testCount) {
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
reportFixtureStart (name, path, meta)
```

Parameter | Type   | Description
--------- | ------ | --------------------------------
`name`    | String | The test fixture name.
`path`    | String | The path to a test fixture file.
`meta`    | Object | The fixture metadata. See [Specifying Testing Metadata](../../test-api/test-code-structure.md#specifying-testing-metadata) for more information.

**Example**

```js
reportFixtureStart (name, path, meta) {
    this.currentFixtureName = name;
    this.currentFixtureMeta = meta;
    this.write(`Starting fixture: ${name} ${meta.fixtureID}`)
        .newline();
}

//=> Starting fixture: First fixture f-0001
```

## reportTestDone

Fires each time a test ends.

```text
reportTestDone (name, testRunInfo, meta)
```

Parameter     | Type   | Description
------------- | ------ | -------------------------------------------------------------
`name`        | String | The test name.
`testRunInfo` | Object | The [testRunInfo](#testruninfo-object) object.
`meta`        | Object | The test metadata. See [Specifying Testing Metadata](../../test-api/test-code-structure.md#specifying-testing-metadata) for more information.

**Example**

```js
reportTestDone (name, testRunInfo, meta) {
    const hasErr = !!testRunInfo.errs.length;
    const result = testRunInfo.skipped ? 'skipped' : hasErr ? `passed` : `failed`;

    name = `${this.currentFixtureName} - ${name}`;

    let title = `${result} ${name}`;

    if (testRunInfo.unstable)
        title += ' (unstable)';

    if (testRunInfo.screenshotPath)
        title += ` (screenshots: ${testRunInfo.screenshotPath})`;

    if (meta.severity)
        title += ' (meta.severity)';

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
`errs`              | Array of Strings | An array of errors that occurred during the test run.
`durationMs`        | Number           | The time spent on test execution (in milliseconds).
`unstable`          | Boolean          | Specifies if the test is marked as unstable.
`screenshotPath`    | String           | The directory path where screenshots are saved to.
`screenshots`       | Array of Objects | An array of [screenshot](#screenshots-object) objects.
`quarantine`        | Object           | A [quarantine](#quarantine-object) object.
`skipped`           | Boolean          | Specifies if the test was skipped.

### screenshots Object

The `screenshot` object provides information about the screenshot captured during the test run. The object has the following properties:

Property            | Type             | Description
------------------- | ---------------- | --------------------------------------------------------
`screenshotPath`    | String           | The directory path where the screenshot was saved to.
`thumbnailPath`     | String           | The directory path where the screenshot's thumbnail was saved to.
`userAgent`         | String           | The user agent string of the browser where the screenshot was captured.
`quarantineAttempt` | Number           | The [quarantine](../../using-testcafe/programming-interface/runner.md#quarantine-mode) attempt's number.
`takenOnFail`       | Boolean          | Specifies if the screenshot was captured when the test failed.

### quarantine Object

The `quarantine` object provides information about [quarantine](../../using-testcafe/programming-interface/runner.md#quarantine-mode)'s attempts in the form of key-value pairs.

Key                               | Value
----------------------------------| ------------------------------------------------
The&nbsp;quarantine&nbsp;attempt's&nbsp;number. |  The object that provides information about the attempt. The object has the boolean `passed` property that specifies if the test passed in the current attempt.

## reportTaskDone

Fires when the task ends.

```text
reportTaskDone (endTime, passed, warnings)
```

Parameter  | Type             | Description
---------- | ---------------- | ----------------------------------------------
`endTime`  | Date             | The date and time when testing completed.
`passed`   | Number           | The number of passed tests.
`warnings` | Array of Strings | An array of warnings that occurred during a task run.

**Example**

```js
reportTaskDone (endTime, passed) {
    const time = this.moment(endTime).format('M/D/YYYY h:mm:ss a');
    const durationMs  = endTime - this.startTime;
    const durationStr = this.moment.duration(durationMs).format('h[h] mm[m] ss[s]');
    const result = passed === this.testCount ?
                `${this.testCount} passed` :
                `${this.testCount - passed}/${this.testCount} failed`;

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
