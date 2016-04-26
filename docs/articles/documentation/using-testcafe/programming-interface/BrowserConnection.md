---
layout: docs
title: BrowserConnection Class
permalink: /documentation/using-testcafe/programming-interface/BrowserConnection.html
---
# BrowserConnection Class

Connection to a remote browser.

Created by the [testCafe.createBrowserConnection](TestCafe.md#createBrowserConnection) function.

**Example**

```js
const createTestCafe   = require('testcafe');
const testCafe         = await createTestCafe('localhost', 1337, 1338);

const remoteConnection = testcafe.createBrowserConnection();

// Outputs remoteConnection.url to visit it from the remote browser.
console.log(remoteConnection.url);

remoteConnection.once('ready', async () => {
    await testCafe
        .createRunner()
        .browsers(remoteConnection)
        .run();
});
```

## Properties

### url

String. A URL that should be visited from a remote browser to connect.

## Events

### ready

Fires when a remote browser has been connected.

```js
browserConnection.once('ready', callback)
```

Typically, you do not need to wait for the **ready** event to fire.
The [runner.run](Runner.md#run) method automatically waits for all browser connections to be established.
If this does not happen within *30* seconds, an error is thrown.
Thus, you need to wait for the **ready** event only if there is a chance that any of your remote connections can take a significant amount of time (more than 30 sec) to establish.