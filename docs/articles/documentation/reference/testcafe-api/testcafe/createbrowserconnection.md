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
let runner           = null;
let testcafe         = null;

createTestCafe('localhost', 1337, 1338)
    .then(tc => {
        testcafe = tc;
        runner   = testcafe.createRunner();

        return testcafe.createBrowserConnection();
    })
    .then(remoteConnection => {

        // Outputs remoteConnection.url so that it can be visited from the remote browser.
        console.log(remoteConnection.url);

        remoteConnection.once('ready', () => {
            runner
                .src('test.js')
                .browsers(remoteConnection)
                .run()
                .then(failedCount => {
                    console.log(failedCount);
                    testcafe.close();
                 })
                .catch(error => { /* ... */});
        });
    });
```
