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

const testcafe = await createTestCafe('localhost', 1337, 1338);

try {
    const runner = testcafe.createRunner();
    const failed = await runner.run();

    console.log('Tests failed: ' + failed);
}
finally {
    await testcafe.close();
}
```
