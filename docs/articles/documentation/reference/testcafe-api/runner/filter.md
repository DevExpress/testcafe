---
layout: docs
title: Runner.filter Method
permalink: /documentation/reference/testcafe-api/runner/filter.html
---
# Runner.filter Method

Allows you to select the tests to run.

```text
filter(callback) → this
```

Parameter  | Type                                                                  | Description
---------- | --------------------------------------------------------------------- | ----------------------------------------------------------------
`callback` | `function(testName, fixtureName, fixturePath, testMeta, fixtureMeta)` | The callback that determines if a particular test should be run.

The callback function is called for each test in the source files. Return `true` from the callback to include the current test or `false` to exclude it.

The callback function accepts the following arguments:

Parameter     | Type   | Description
------------- | ------ | ----------------------------------
`testName`    | String | The name of the test.
`fixtureName` | String | The name of the test fixture.
`fixturePath` | String | The path to the test fixture file.
`testMeta`    | Object | The test metadata.
`fixtureMeta` | Object | The fixture metadata.

> Use the [src](src.md) method to specify the source files.

*Related configuration file property*: [filter](../../configuration-file.md#filter)

**Example**

```js
runner.filter((testName, fixtureName, fixturePath, testMeta, fixtureMeta) => {
    return fixturePath.startsWith('D') &&
        testName.match(someRe) &&
        fixtureName.match(anotherRe) &&
        testMeta.mobile === 'true' &&
        fixtureMeta.env === 'staging';
});
```
