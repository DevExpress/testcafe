---
layout: docs
title: TestCafe.createRunner Method
permalink: /documentation/reference/testcafe-api/testcafe/createrunner.html
---
# TestCafe.createRunner Method

Creates a [test runner](../runner/README.md) that is used to configure and launch test tasks.

```text
createRunner() → Runner
```

**Example**

```js
const createTestCafe = require('testcafe');

const testcafe = await createTestCafe('localhost', 1337, 1338);
const runner   = testcafe.createRunner();

const failedCount = await runner
    .src(['tests/fixture1.js', 'tests/func/fixture3.js'])
    .browsers(['chrome', 'safari'])
    .run();

console.log('Tests failed: ' + failedCount);
await testcafe.close();
```
