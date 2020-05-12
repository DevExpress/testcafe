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
let testcafe         = null;

createTestCafe('localhost', 1337, 1338)
    .then(tc => {
        testcafe     = tc;
        const runner = testcafe.createRunner();

        return runner
            .src(['tests/fixture1.js', 'tests/func/fixture3.js'])
            .browsers(['chrome', 'safari'])
            .run();
    })
    .then(failedCount => {
        console.log('Tests failed: ' + failedCount);
        testcafe.close();
    });
```
