---
layout: docs
title: TestCafe.createLiveModeRunner Method
permalink: /documentation/reference/testcafe-api/testcafe/createlivemoderunner.html
---
# TestCafe.createLiveModeRunner Method

Creates a [test runner](../livemoderunner.md) that runs TestCafe in [live mode](../../../guides/basic-guides/run-tests.md#live-mode). In this mode, TestCafe watches for changes you make in the test files and all files referenced in them (like page objects or helper modules). The tests restart immediately after these changes, so you get real-time updates.

```text
createLiveModeRunner() → LiveModeRunner
```

[LiveModeRunner](../livemoderunner.md) is a [Runner](../runner/README.md) descendant and provides the same API (with the following [limitations](../livemoderunner.md#limitations)).

**Example**

```js
const createTestCafe = require('testcafe');

const testcafe   = await createTestCafe('localhost', 1337, 1338)
const liveRunner = testcafe.createLiveModeRunner();

await liveRunner
    .src('tests/test.js')
    .browsers('chrome')
    .run();

await testcafe.close();
```

> Important! You cannot create multiple live mode runners for the same TestCafe server instance. This is because a TestCafe server can handle only one watcher that tracks changes to test files.
