---
layout: docs
title: TestCafe.close Method
permalink: /documentation/reference/testcafe-api/testcafe/close.html
---
# TestCafe.close Method

Stops the TestCafe server. Forcibly closes all connections and pending test runs.

```text
async close() → Promise<void>
```

```js
const createTestCafe = require('testcafe');
let testcafe         = null;

createTestCafe('localhost', 1337, 1338)
    .then(tc => {
        testcafe     = tc;
        const runner = testcafe.createRunner();

        return runner.run();
    })
    .then(failed => {
        console.log('Tests failed: ' + failed);
        testcafe.close();
    })
    .catch(error => { /* ... */ });
```
