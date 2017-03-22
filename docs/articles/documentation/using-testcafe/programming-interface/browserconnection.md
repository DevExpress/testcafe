---
layout: docs
title: BrowserConnection Class
permalink: /documentation/using-testcafe/programming-interface/browserconnection.html
checked: true
---
# BrowserConnection Class

A connection to a remote browser.

Created by the [testCafe.createBrowserConnection](testcafe.md#createbrowserconnection) function.

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

## Properties

### url

String. A URL that should be visited from a remote browser in order to connect it to the TestCafe server.

## Events

### ready

Fires when a remote browser connects to the TestCafe server.

```js
browserConnection.once('ready', callback)
```

Typically, you can run tests without waiting for the `ready` event to fire.
The [runner.run](runner.md#run) method automatically waits for all browser connections to be established.
If remote browsers do not connect within **30** seconds, an error is thrown.
Thus, you need to wait for the `ready` event only if there is a chance that any of your remote connections
take more than 30 seconds to establish.