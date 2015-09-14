---
layout: docs
title: BrowserConnection Class
permalink: /documentation/api-reference/BrowserConnection/
---
# BrowserConnection Class

The server part of a remote browser connection.

Created by the [testCafe.createBrowserConnection](/testcafe/documentation/api-reference/TestCafe/#createBrowserConnection) function.

#### Example

```js
var createTestCafe = require('testcafe');
var testCafe = await createTestCafe('localhost', 1337, 1338);

var remoteConnection = testcafe.createBrowserConnection();

console.log(remoteConnection.url);
remoteConnection.on('ready', () => {
    await testCafe
        .createRunner()
        .browsers(remoteConnection)
        .run();
});
```

## Fields

### <a class="anchor" name="url"></a>url → String

A URL that should be visited from a remote browser to connect.

## Events

### <a class="anchor" name="ready"></a>ready

Fires when a remote browser has been connected.

```js
browserConnection.on('ready', callback)
```