---
layout: docs
title: BrowserConnection Object
permalink: /documentation/reference/testcafe-api/browserconnection/
redirect_from:
  - /documentation/using-testcafe/programming-interface/browserconnection.html
---
# BrowserConnection Object

A connection to a [remote browser](../../../guides/concepts/browsers.md#browsers-on-remote-devices).

Use this object to run tests on a remote or a mobile device.

`BrowserConnection` is created with the [testCafe.createBrowserConnection](../testcafe/createbrowserconnection.md) function.

The [browserConnection.url](url.md) property returns a URL the remote browser should visit in order to connect to the [TestCafe server instance](../testcafe/README.md).

When the remote browser establishes connection, the [browserConnection.ready](ready.md) event fires. After that, you can pass the `BrowserConnection` to [runner.browsers](../runner/browsers.md) and start tests.

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
                 });
        });
    });
```
