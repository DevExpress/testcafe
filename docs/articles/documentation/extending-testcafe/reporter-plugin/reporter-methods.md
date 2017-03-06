---
layout: docs
title: Reporter Methods
permalink: /documentation/extending-testcafe/reporter-plugin/reporter-methods.html
checked: false
---
# Reporter Methods

To create a [reporter](README.md#implementing-the-reporter), you need to implement the following methods.

> You can use [helper methods and libraries](helpers.md) within the reporter methods to output required data.

## reportTaskStart

Fires when a test task starts, which happens at the beginning of testing.

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
reportFixtureStart (name, path)
```

Parameter | Type   | Description
--------- | ------ | --------------------------------
`name`    | String | The test fixture name.
`path`    | String | The path to a test fixture file.

**Example**

```js
reportFixtureStart (name) {
    this.currentFixtureName = name;
    this.write(`Starting fixture: ${name}`)
        .newline();
}

//=> Starting fixture: First fixture
```

## reportTestDone

Fires each time a test ends.

```text
reportTestDone (name, testRunInfo)
```

Parameter     | Type   | Description
------------- | ------ | -------------------------------------------------------------
`name`        | String | The test name.
`testRunInfo` | Object | The object providing detailed information about the test run.

The `testRunInfo` object has the following properties.

Property         | Type             | Description
---------------- | ---------------- | --------------------------------------------------------
`errs`           | Array or Strings | An array of errors that occurred during a test run.
`durationMs`     | Number           | The time spent on test execution (in milliseconds).
`unstable`       | Boolean          | Specifies if the test has been marked as unstable.
`screenshotPath` | String           | The directory path where screenshots have been saved to.
`skipped`        | Boolean          | Specifies if the test was skipped.

**Example**

```js
reportTestDone (name, testRunInfo) {
    const hasErr = !!testRunInfo.errs.length;
    const result = testRunInfo.skipped ? 'skipped' : hasErr ? `passed` : `failed`;

    name = `${this.currentFixtureName} - ${name}`;

    let title = `${result} ${name}`;

    if (testRunInfo.unstable)
        title += ' (unstable)';

    if (testRunInfo.screenshotPath)
        title += ` (screenshots: ${testRunInfo.screenshotPath})`;

    this.write(title)
        .newline();
}

//=> failed First fixture - First test in first fixture (unstable) (screenshots: /screenshots/1445437598847)
//=> passed First fixture - Second test in first fixture (screenshots: /screenshots/1445437598847)
//=> failed First fixture - Third test in first fixture
//=> skipped First fixture - Fourth test in first fixture
```

## reportTaskDone

Fires when the entire task ends, which happens at the end of testing.

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