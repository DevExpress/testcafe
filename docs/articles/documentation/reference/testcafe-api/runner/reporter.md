---
layout: docs
title: Runner.reporter Method
permalink: /documentation/reference/testcafe-api/runner/reporter.html
---
# Runner.reporter Method

Configures how TestCafe generates test run reports.

```text
reporter(name, output) → this
reporter(fn) → this
reporter([ name | { name, output } | fn ]) → this
```

Parameter                | Type                        | Description                                     | Default
------------------------ | --------------------------- | ----------------------------------------------- | --------
`name`                   | String      | The name of the [reporter](../../../guides/concepts/reporters.md).
`output`&#160;*(optional)* | String &#124; Writable Stream implementer | The file path where the report is written or the output stream. | `stdout`
`fn` | A function that [returns a custom reporter object](#specify-a-custom-reporter).

To use a single reporter, specify a reporter name and, optionally, an output target as the second parameter.

To use multiple reporters, pass an array to this method. This array can include both strings (the reporter name) and `{ name, output }` objects (if you wish to specify the output target). See examples below.

Note that if you use multiple reporters, only one can write to `stdout`.

*Related configuration file property*: [reporter](../../configuration-file.md#reporter)

## Specify the Reporter

```js
runner.reporter('minimal');
```

## Save the Report to a File

```js
runner.reporter('xunit', 'reports/report.xml');
```

## Use Multiple Reporters

```js
runner.reporter(['spec', {
    name: 'json',
    output: 'reports/report.json'
}]);
```

## Specify a Custom Reporter

You can implement a [custom reporter](../../../guides/extend-testcafe/reporter-plugin.md) in the code that launches tests. This approach allows you to implement your reporter faster if you need it for a single project or do not want to publish a reporter plugin.

Pass a *function* that returns the custom reporter object to the `runner.reporter` method.

```js
import { createTestCafe } from 'testcafe';

const customReporter = () => {
    return {
        async reportTaskStart (startTime, userAgents, testCount) { /* ... */ },
        async reportFixtureStart (name, path, meta) { /* ... */ },
        async reportTestDone (name, testRunInfo, meta) { /* ... */ },
        async reportTaskDone (endTime, passed, warnings, result) { /* ... */ }
    };
};

const testcafe = await createTestCafe(/* [...] */);
const runner   = testcafe.createRunner();

await runner.reporter(customReporter);
```

## Implement a Custom Stream

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

You can also build your own reporter. Use a [dedicated Yeoman generator](https://github.com/DevExpress/generator-testcafe-reporter) to scaffold out a [reporter plugin](../../../guides/extend-testcafe/reporter-plugin.md).
