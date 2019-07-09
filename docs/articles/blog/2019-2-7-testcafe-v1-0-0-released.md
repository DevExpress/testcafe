---
layout: post
title: TestCafe v1.0.0 Released
permalink: /blog/:title.html
---
# TestCafe v1.0.0 Released

TestCafe v1.0.0 is our first major update that includes features like video recording, configuration file, "live mode" for rapid test development and much more.

<!--more-->

## Breaking Changes

TestCafe v1.0.0 introduces minor changes to the framework's behavior and programming interface. You can find the details in the [migration guide](https://devexpress.github.io/testcafe/blog/migration-from-testcafe-v0-x-y-to-v1-0-0.html).

## Enhancements

### ⚙ Video Recording ([#2151](https://github.com/DevExpress/testcafe/issues/2151))

You can now [record videos of test runs](https://devexpress.github.io/testcafe/documentation/using-testcafe/common-concepts/screenshots-and-videos.html#record-videos) in Google Chrome and Mozilla Firefox. To enable video recording, [install the FFmpeg library](https://devexpress.github.io/testcafe/documentation/using-testcafe/common-concepts/screenshots-and-videos.html#prerequisites) and then do one of the following:

* specify the [--video](https://devexpress.github.io/testcafe/documentation/using-testcafe/command-line-interface.html#--video-basepath) command line flag,

    ```sh
    testcafe chrome test.js --video artifacts/videos/
    ```

* call the [runner.video](https://devexpress.github.io/testcafe/documentation/using-testcafe/programming-interface/runner.html#video) API method,

    ```js
    runner.video('artifacts/videos/');
    ```

* specify the [videoPath](https://devexpress.github.io/testcafe/documentation/using-testcafe/configuration-file.html#videopath) configuration file property (configuration file is also a new feature, see below).

    ```json
    {
        "videoPath": "artifacts/videos/"
    }
    ```

TestCafe records all tests and saves each recording in a separate file. You can change this behavior in [video options](https://devexpress.github.io/testcafe/documentation/using-testcafe/common-concepts/screenshots-and-videos.html#basic-video-options). You can also customize [video encoding parameters](https://devexpress.github.io/testcafe/documentation/using-testcafe/common-concepts/screenshots-and-videos.html#video-encoding-options).

### ⚙ Configuration File ([#3131](https://github.com/DevExpress/testcafe/issues/3131))

TestCafe now allows you to store its settings in the `.testcaferc.json` [configuration file](https://devexpress.github.io/testcafe/documentation/using-testcafe/configuration-file.html) (with support for `JSON5` syntax).

```json
{
    "browsers": "chrome",
    "src": ["/home/user/auth-tests/fixture-1.js", "/home/user/mobile-tests/"],
    "reporter": {
        "name": "xunit",
        "output": "reports/report.xml"
    },
    "screenshotPath": "/home/user/tests/screenshots/",
    "takeScreenshotsOnFails": true,
    "videoPath": "/home/user/tests/videos/",
    "pageLoadTimeout": 1000,
    "hostname": "host.mycorp.com"
    // and more
}
```

Keep the configuration file in the project's root directory from which you run TestCafe.

Settings you specify when you launch tests from the command line and programming interfaces override settings from `.testcaferc.json`.

See [Configuration File](https://devexpress.github.io/testcafe/documentation/using-testcafe/configuration-file.html) for more information.

### ⚙ Live Mode ([#3215](https://github.com/DevExpress/testcafe/issues/3215))

We have integrated the [testcafe-live](https://github.com/DevExpress/testcafe-live) module into our main code so you can now use the new [live mode](https://devexpress.github.io/testcafe/documentation/using-testcafe/common-concepts/live-mode.html).

Live mode keeps the TestCafe process and browsers opened the whole time you are working on tests. Changes you make in code immediately restart the tests. That is, live mode allows you to see test results instantly. See [How Live Mode Works](https://devexpress.github.io/testcafe/documentation/using-testcafe/common-concepts/live-mode.html#how-live-mode-works).

Use the [-L (--live)](https://devexpress.github.io/testcafe/documentation/using-testcafe/command-line-interface.html#-l---live) flag to enable live mode from the command line interface.

```sh
testcafe chrome tests/test.js -L
```

In the API, create a [live mode runner](https://devexpress.github.io/testcafe/documentation/using-testcafe/programming-interface/livemoderunner.html) with the [testcafe.createLiveModeRunner](https://devexpress.github.io/testcafe/documentation/using-testcafe/programming-interface/testcafe.html#createlivemoderunner) function and use it instead of a [regular test runner](https://devexpress.github.io/testcafe/documentation/using-testcafe/programming-interface/runner.html).

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

### ⚙ Custom Reporter API Enhancements (Part of [#2753](https://github.com/DevExpress/testcafe/issues/2753); [Pull Request](https://github.com/DevExpress/testcafe/pull/3177))

* You can now access warnings that appeared during the test run from the [reportTestDone](https://devexpress.github.io/testcafe/documentation/extending-testcafe/reporter-plugin/reporter-methods.html#reporttestdone) method. To do this, use the [testRunInfo](https://devexpress.github.io/testcafe/documentation/extending-testcafe/reporter-plugin/reporter-methods.html#testruninfo-object) object's `warnings` property.

    ```js
    async reportTestDone (name, testRunInfo, meta) {
        const warnings    = testRunInfo.warnings;
        const hasWarnings = !!warnings.length;

        if(hasWarnings) {
            this.newline()
                .write('Warnings:');

            warnings.forEach(warning => {
                this.newline()
                    .write(warning);
            });
        }
    }
    ```

* The [reportTaskDone](https://devexpress.github.io/testcafe/documentation/extending-testcafe/reporter-plugin/reporter-methods.html#reporttaskdone) method now receives the [result](https://devexpress.github.io/testcafe/documentation/extending-testcafe/reporter-plugin/reporter-methods.html#result-object) parameter that contains information about the number of passed, failed, and skipped tests.

    ```js
    async reportTaskDone (endTime, passed, warnings, result) {
        this.write(`Testing finished!`)
            .newline()
            .write(`Passed: ${result.passedCount}`)
            .newline()
            .write(`Failed: ${result.failedCount}`)
            .newline();
            .write(`Skipped: ${result.skippedCount}`)
            .newline();
    }
    ```

### ⚙ Typings for Programming Interface ([#3341](https://github.com/DevExpress/testcafe/issues/3341)) by [@infctr](https://github.com/infctr)

TestCafe [programming interface](https://devexpress.github.io/testcafe/documentation/using-testcafe/programming-interface/) now features TypeScript typings.

![API Typings](../images/api-typings.png)

### ⚙ Programming Interface: Simpler API to Write Reports to a File

You no longer need to use `fs.createWriteStream` to create a stream that writes a report to a file. You can now pass the file name as the [runner.reporter](https://devexpress.github.io/testcafe/documentation/using-testcafe/programming-interface/runner.html#reporter) parameter.

```js
runnner.reporter('json', 'reports/report.json');
```

## Bug Fixes

* The test runner no longer hangs when a custom reporter implementation uses synchronous callbacks ([#3209](https://github.com/DevExpress/testcafe/issues/3209))
* Fixture hooks for two adjacent fixtures are now executed in the correct order ([#3298](https://github.com/DevExpress/testcafe/issues/3298))
* Iframes no longer throw an error after a `document.open` call in IE and Edge ([#3343](https://github.com/DevExpress/testcafe/issues/3343))
* TestCafe no longer triggers a click event when you disable a button with a `span` element inside ([#2902](https://github.com/DevExpress/testcafe/issues/2902))
* Fixed a bug that led to errors in certain cases ([#3189](https://github.com/DevExpress/testcafe/issues/3189))
* We have improved the status panel design and adaptivity ([#3073](https://github.com/DevExpress/testcafe/issues/3073))
* Redirects through several pages in iframes now work correctly ([testcafe-hammerhead/#1825](https://github.com/DevExpress/testcafe-hammerhead/issues/1825))
* TestCafe can now correctly work with pages that override `HTMLElement.classList` in IE11 ([testcafe-hammerhead/#1890](https://github.com/DevExpress/testcafe-hammerhead/issues/1890))