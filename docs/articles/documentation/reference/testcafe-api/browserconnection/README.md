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

You can create a new `BrowserConnection` with the [testCafe.createBrowserConnection](../testcafe/createbrowserconnection.md) function.

The [browserConnection.url](url.md) property returns a URL. Remote browsers can use this URL to connect to a [TestCafe server instance](../testcafe/README.md).

When the remote browser establishes connection, the [browserConnection.opened](opened.md) event fires. After that, you can pass the `BrowserConnection` to [runner.browsers](../runner/browsers.md) and start tests.

**Example**

```js
const createTestCafe = require('testcafe');

const testcafe         = await createTestCafe('localhost', 1337, 1338)
const runner           = testcafe.createRunner();
const remoteConnection = await testcafe.createBrowserConnection();

// Outputs the remoteConnection.url to allow access from a remote browser.
console.log(remoteConnection.url);

remoteConnection.once('opened', () => {
    const failedCount = await runner
        .src('test.js')
        .browsers(remoteConnection)
        .run();

    console.log(failedCount);
    await testcafe.close();
});
```
