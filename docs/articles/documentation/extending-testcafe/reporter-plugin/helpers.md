---
layout: docs
title: Helpers
permalink: /documentation/extending-testcafe/reporter-plugin/helpers.html
checked: true
---
# Helpers

Helpers are methods and libraries used to format report output when [implementing a reporter](README.md#implementing-the-reporter). TestCafe mixes in these methods to the reporter.

To access helpers, use `this`.

This topic contains information about several groups of helpers.

* [Output Helpers](#output-helpers)
* [Formatting Helpers](#formatting-helpers)
* [Coloring Helper](#coloring-helper)
* [Date-Time Helper](#datetime-helper)

## Output Helpers

All output helper methods are chainable: each method returns `this` so that the methods can be executed one right after another.
This allows you to write compact code like this.

```js
this.setIndent(4)
    .write(testname)
    .newline()
    .write(result);
```

### newline

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

### write

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

### useWordWrap

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

### setIndent

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

## Formatting Helpers

### indentString

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

### wordWrap

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

### escapeHtml

Encodes a string for use in HTML.

```text
escapeHtml (str) → String
```

Parameter   | Type   | Description
----------- | ------ | ------------------------------
`str`       | String | The string to be encoded.

**Example**

The following example demonstrates how to escape the fixture name *Tests for the "Example" page* for HTML.

```js
async reportFixtureStart (name, path, meta) {
    this.currentFixtureName = this.escapeHtml(name);
    this.write(this.currentFixtureName);
}
//=>Tests for the &quot;Example&quot; page
```

### formatError

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

## Coloring Helper

### chalk

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

## Date/Time Helper

### moment

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