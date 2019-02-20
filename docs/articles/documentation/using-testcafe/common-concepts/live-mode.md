---
layout: docs
title: Live Mode
permalink: /documentation/using-testcafe/common-concepts/live-mode.html
---
# Live Mode

Live mode ensures the TestCafe process and browsers remain active while you work on tests. You can see test results instantly because the tests are restarted when you make changes.

![Live mode demonstrated in action](../../../images/testcafe-live.gif)

> This feature replaces the `testcafe-live` module. This module is now deprecated.

## How to Enable Live Mode

Use the [-L (--live)](../command-line-interface.md#-l---live) flag to enable live mode from the command line interface.

```sh
testcafe chrome tests/test.js -L
```

In the API, create a [live mode runner](../programming-interface/livemoderunner.md) with the [testcafe.createLiveModeRunner](../programming-interface/testcafe.md#createlivemoderunner) function and use it instead of a [regular test runner](../programming-interface/runner.md).

```js
const createTestCafe = require('testcafe');
let testcafe         = null;

createTestCafe('localhost', 1337, 1338)
    .then(tc => {
        testcafe         = tc;
        const liveRunner = testcafe.createLiveModeRunner();

        return liveRunner
            .src('tests/test.js')
            .browsers('chrome')
            .run();
    })
    .then(() => {
        testcafe.close();
    });
```

## How Live Mode Works

When you run tests with live mode enabled, TestCafe opens the browsers, runs the tests, shows the reports, and waits for further actions.

Then TestCafe starts watching for changes in the test files and all files referenced in them (like page objects or helper modules). Once you make changes in any of those files and save them, TestCafe immediately reruns the tests.

When the tests are done, browsers stay on the last opened page so you can work with it and explore it with the browser's developer tools.

You can use live mode with any browsers: local, remote, mobile or headless.

> Important! Live mode is designed to work with tests locally. Do not use it in CI systems.

**Tip:** use the [only](../../test-api/test-code-structure.md#skipping-tests) function to work with a single test.

### Console Shortcuts in Live Mode

* `Ctrl+S` - stops the current test run;
* `Ctrl+R` - restarts the current test run;
* `Ctrl+W` - turns off/on the file watcher;
* `Ctrl+C` - closes opened browsers and terminates the process.
