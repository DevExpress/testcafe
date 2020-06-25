---
layout: docs
title: TestCafe.createBrowserConnection Method
permalink: /documentation/reference/testcafe-api/testcafe/createbrowserconnection.html
---
# TestCafe.createBrowserConnection Method

Creates a [remote browser connection](../browserconnection/README.md).

```text
async createBrowserConnection() → Promise<BrowserConnection>
```

To connect a remote browser, navigate to [BrowserConnection.url](../browserconnection/url.md).

**Example**

```js
const createTestCafe = require('testcafe');

const testcafe         = await createTestCafe('localhost', 1337, 1338);
const runner           = testcafe.createRunner();
const remoteConnection = await testcafe.createBrowserConnection();

// Outputs remoteConnection.url so that it can be visited from the remote browser.
console.log(remoteConnection.url);

remoteConnection.once('ready', async () => {
    const failedCount = await runner
        .src('test.js')
        .browsers(remoteConnection)
        .run();

    console.log(failedCount);
    await testcafe.close();
});
```
