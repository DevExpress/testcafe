---
layout: docs
title: TestCafe Class
permalink: /documentation/api-reference/TestCafe/
---
# TestCafe Class

A TestCafe server.

Use the [createTestCafe](/testcafe/documentation/api-reference/global/#createTestCafe) global function to create a TestCafe instance.

```js
var createTestCafe = require('testcafe');
var testCafe = await createTestCafe('localhost', 1337, 1338);
```

## Functions

### <a class="anchor" name="createBrowserConnection"></a>createBrowserConnection() → [BrowserConnection](/testcafe/documentation/api-reference/BrowserConnection/)

Creates the server part of a [remote browser connection](/testcafe/documentation/api-reference/BrowserConnection/).

To connect, visit [BrowserConnection.url](/testcafe/documentation/api-reference/BrowserConnection/#url) from the remote browser.

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

### <a class="anchor" name="createRunner"></a>createRunner() → [Runner](/testcafe/documentation/api-reference/Runner/)

Creates the [test runner](/testcafe/documentation/api-reference/Runner/) that is used to configure and launch test runs.

#### Example

```js
var createTestCafe = require('testcafe');
var testCafe = await createTestCafe('localhost', 1337, 1338);

testCafe
    .createRunner()
    .src(['/tests/fixture1.js', '/tests/func/fixture3.js'])
    .browsers(['chrome', 'firefox'])
    .run()
    .then(failed => console.log('Tests failed: ' + failed));
```

### <a class="anchor" name="close"></a>close()

Stops the TestCafe server. Forcibly closes all connections immediately.