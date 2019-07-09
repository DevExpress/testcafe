---
layout: docs
title: Screenshots and Videos
permalink: /documentation/using-testcafe/common-concepts/screenshots-and-videos.html
---
# Screenshots and Videos

TestCafe allows you to take screenshots of the tested webpage and record videos of test runs.

* [Screenshots](#screenshots)
  * [Prerequisites for Screenshots](#prerequisites-for-screenshots)
  * [Enable Screenshots](#enable-screenshots)
  * [Take Screenshots at Arbitrary Moments During Test Run](#take-screenshots-at-arbitrary-moments-during-test-run)
  * [Take Screenshots When a Test Fails](#take-screenshots-when-a-test-fails)
* [Record Videos](#record-videos)
  * [Prerequisites for Video Recording](#prerequisites-for-video-recording)
  * [Enable Video Recording](#enable-video-recording)
  * [Basic Video Options](#basic-video-options)
  * [Video Encoding Options](#video-encoding-options)
* [Where Screenshots and Videos Are Saved](#where-screenshots-and-videos-are-saved)
  * [Default Path Patterns](#default-path-patterns)
  * [Custom Path Patterns](#custom-path-patterns)
    * [Screenshot Custom Path Pattern](#screenshot-custom-path-pattern)
    * [Video Custom Path Pattern](#video-custom-path-pattern)
  * [Path Pattern Placeholders](#path-pattern-placeholders)

## Screenshots

TestCafe allows you to take screenshots of the tested webpage at any moment during test run, or automatically whenever a test fails.

> Important! Screenshots are not supported when you run tests in [remote browsers](browsers/browser-support.md#browsers-on-remote-devices).

### Prerequisites for Screenshots

Screenshots require .NET 4.0 or newer installed on Windows machines and an [ICCCM/EWMH-compliant window manager](https://en.wikipedia.org/wiki/Comparison_of_X_window_managers) on Linux.

### Enable Screenshots

To enable TestCafe to take screenshots, use either of the following:

* the [-s (--screenshots)](../command-line-interface.md#-s-path---screenshots-path) command line flag,

    ```sh
    testcafe chrome test.js -s artifacts/screenshots
    ```

* the [runner.screenshots](../programming-interface/runner.md#screenshots) API method,

    ```js
    runner.screenshots('artifacts/screenshots');
    ```

* the [screenshotPath](../configuration-file.md#screenshotpath) configuration file property.

    ```json
    {
        "screenshotPath": "artifacts/screenshots"
    }
    ```

You must provide the base path where TestCafe stores screenshots to this flag, method or property. See [Where Screenshots and Videos Are Saved](#where-screenshots-and-videos-are-saved) for more information.

### Take Screenshots at Arbitrary Moments During Test Run

You can take screenshots at any moment during test run. Use the [t.takeScreenshot](../../test-api/actions/take-screenshot.md#take-a-screenshot-of-the-entire-page) action to take a screenshot of the entire page, or the [t.takeElementScreenshot](../../test-api/actions/take-screenshot.md#take-a-screenshot-of-a-page-element) action to capture a particular element.

```js
fixture `My fixture`
    .page `http://devexpress.github.io/testcafe/example/`;

test('Take a screenshot of a fieldset', async t => {
    await t
        .typeText('#developer-name', 'Peter Parker')
        .click('#tried-test-cafe')
        .typeText('#comments', 'I think TestCafe is awesome!')
        .takeElementScreenshot('#comments')
        .click('#submit-button')
        .takeScreenshot();
});
```

### Take Screenshots When a Test Fails

You can configure TestCafe to automatically take a screenshot whenever a test fails. Use either of the following:

* the [-S (--screenshots-on-fails)](../command-line-interface.md#-s---screenshots-on-fails) command line flag,

    ```sh
    testcafe chrome tests/sample-fixture.js -S -s artifacts/screenshots
    ```

* the `takeOnFails` parameter of the [runner.screenshots](../programming-interface/runner.md#screenshots) API method,

    ```js
    runner.screenshots('artifacts/screenshots', true);
    ```

* the [takeScreenshotsOnFails](../configuration-file.md#takescreenshotsonfails) configuration file property.

    ```json
    {
        "takeScreenshotsOnFails": true
    }
    ```

## Record Videos

TestCafe allows you to record videos of test runs.

> Important! Video recording is supported in Google Chrome and Mozilla Firefox only. TestCafe cannot record videos when you run tests in [remote browsers](browsers/browser-support.md#browsers-on-remote-devices).

### Prerequisites for Video Recording

You should install [the FFmpeg library](https://ffmpeg.org/) to record videos.

Do one of the following if TestCafe cannot find the FFmpeg library:

* Add the FFmpeg installation directory to the system's `PATH` environment variable;
* Specify the path to the FFmpeg executable in the `FFMPEG_PATH` environment variable or the `ffmpegPath` parameter in [video options](#basic-video-options);
* Install the `@ffmpeg-installer/ffmpeg` package from npm.

Videos are saved in the `.mp4` format.

### Enable Video Recording

Use either of the following to enable video recording:

* the [--video](../command-line-interface.md#--video-basepath) command line flag,

    ```sh
    testcafe chrome test.js --video artifacts/videos
    ```

* the [runner.video](../programming-interface/runner.md#video) API method,

    ```js
    runner.video('artifacts/videos');
    ```

* the [videoPath](../configuration-file.md#videopath) configuration file property.

    ```json
    {
        "videoPath": "artifacts/videos"
    }
    ```

You should provide the base path where TestCafe stores videos to this flag, method or property. See [Where Screenshots and Videos Are Saved](#where-screenshots-and-videos-are-saved) for more information.

TestCafe records all the tests and saves the recording of each test in a separate file. To change this behavior, use the `failedOnly` and `singleFile` [video options](#basic-video-options).

### Basic Video Options

TestCafe supports the following video options:

Option | Type | Description | Default Value
------ | ---- | ----------- | --------------
`failedOnly` | Boolean | `true` to record only failed tests; `false` to record all tests. | `false`
`singleFile` | Boolean | `true` to save the entire recording as a single file; `false` to create a separate file for each test. | `false`
`ffmpegPath` | String | The path to the FFmpeg codec executable. | Auto-detected
`pathPattern` | String | A pattern that defines how TestCafe composes the relative path to a video file and the file name. See [Where Screenshots and Videos Are Saved](#where-screenshots-and-videos-are-saved). | See [Default Path Patterns](#default-path-patterns).

You can specify video options in either of the following ways:

* the [--video-options](../command-line-interface.md#--video-options-optionvalueoption2value2) command line flag,

    ```sh
    testcafe chrome test.js --video artifacts/videos --video-options singleFile=true,failedOnly=true,pathPattern=${TEST_INDEX}/${USERAGENT}/${FILE_INDEX}.mp4
    ```

* the `options` parameter of the [runner.video](../programming-interface/runner.md#video) API method,

    ```js
    runner.video('artifacts/videos', {
        singleFile: true,
        failedOnly: true,
        pathPattern: '${TEST_INDEX}/${USERAGENT}/${FILE_INDEX}.mp4'
    });
    ```

* the [videoOptions](../configuration-file.md#videooptions) configuration file property.

    ```json
    {
        "videoOptions": {
            "singleFile": true,
            "failedOnly": true,
            "pathPattern": "${TEST_INDEX}/${USERAGENT}/${FILE_INDEX}.mp4"
        }
    }
    ```

### Video Encoding Options

These encoding options are passed to FFmpeg. Refer to the [FFmpeg documentation](https://ffmpeg.org/ffmpeg.html#Options) for information about all the available options.

To provide video encoding options, use either of the following options:

* the [--video-encoding-options](../command-line-interface.md#--video-encoding-options-optionvalueoption2value2) command line flag,

    ```sh
    testcafe chrome test.js --video artifacts/videos --video-encoding-options r=20,aspect=4:3
    ```

* the `encodingOptions` parameter of the [runner.video](../programming-interface/runner.md#video) API method,

    ```js
    runner.video('artifacts/videos', { }, {
        r: 20,
        aspect: '4:3'
    });
    ```

* the [videoEncodingOptions](../configuration-file.md#videoencodingoptions) configuration file property.

    ```json
    {
        "videoEncodingOptions": {
            "r": 20,
            "aspect": "4:3"
        }
    }
    ```

## Where Screenshots and Videos Are Saved

You should specify the base path to the directory that stores screenshots or videos to enable these features. See [Enable Screenshots](#enable-screenshots) and [Enable Video Recording](#enable-video-recording).

Inside the base directory, screenshots and videos are organized into subdirectories and named according to the [default](#default-path-patterns) or [custom](#custom-path-patterns) *path patterns*.

> When you pass a specific path to the [t.takeScreenshot](../../test-api/actions/take-screenshot.md#take-a-screenshot-of-the-entire-page) or [t.takeElementScreenshot](../../test-api/actions/take-screenshot.md#take-a-screenshot-of-a-page-element) action, this path overrides the relative path defined by the [default](#default-path-patterns) or [custom path pattern](#custom-path-patterns).

### Default Path Patterns

TestCafe composes paths to screenshots and videos according to the following pattern:

```sh
${DATE}_${TIME}/${TEST_ID}/${RUN_ID}/${USERAGENT}/${FILE_INDEX}.<ext>
```

where `<ext>` is `.png` for screenshots and `.mp4` for videos. See the meaning of other placeholders in the [Path Pattern Placeholders](#path-pattern-placeholders) section.

When TestCafe takes a screenshot because a test fails (see [Take Screenshots When a Test Fails](#take-screenshots-when-a-test-fails)), it adds the `errors` subfolder to the pattern.

```sh
${DATE}_${TIME}/${TEST_ID}/${RUN_ID}/${USERAGENT}/errors/${FILE_INDEX}.png
```

### Custom Path Patterns

You can override the default path pattern for screenshots and videos.

To compose a custom pattern, use placeholders described in the [Path Pattern Placeholders](#path-pattern-placeholders) section.

#### Screenshot Custom Path Pattern

To specify a path pattern for screenshots, use one of the following:

* the [-p (--screenshot-path-pattern)](../command-line-interface.md#-p-pattern---screenshot-path-pattern-pattern) command line flag,

    ```sh
    testcafe chrome test.js -s artifacts/screenshots -p '${DATE}_${TIME}/test-${TEST_INDEX}/${USERAGENT}/${FILE_INDEX}.png'
    ```

    In Windows `cmd.exe` shell, enclose the pattern in double quotes if it contains spaces:

    ```sh
    testcafe chrome test.js -s artifacts/screenshots -p "${DATE} ${TIME}/test ${TEST_INDEX}/${USERAGENT}/${FILE_INDEX}.png"
    ```

* the `pathPattern` parameter of the [runner.screenshots](../programming-interface/runner.md#screenshots) API method,

    ```js
    runner.screenshots('artifacts/screenshots', true, '${DATE}_${TIME}/test-${TEST_INDEX}/${USERAGENT}/${FILE_INDEX}.png');
    ```

* the [screenshotPathPattern](../configuration-file.md#screenshotpathpattern) configuration file property.

    ```json
    {
        "screenshotPathPattern": "${DATE}_${TIME}/test-${TEST_INDEX}/${USERAGENT}/${FILE_INDEX}.png"
    }
    ```

#### Video Custom Path Pattern

To specify a custom path pattern for videos, pass the `pathPattern` parameter to [video options](#basic-video-options).

### Path Pattern Placeholders

The following placeholders are used in screenshot and video path patterns:

Placeholder | Description
----------- | ------------
`${DATE}` | The test run's start date (YYYY-MM-DD).
`${TIME}` | The test run's start time (HH-mm-ss).
`${TEST_INDEX}` | The test's index.
`${FILE_INDEX}` | The screenshot file's index.
`${QUARANTINE_ATTEMPT}` | The [quarantine](../programming-interface/runner.md#quarantine-mode) attempt's number. If the quarantine mode is disabled, the `${QUARANTINE_ATTEMPT}` placeholder's value is 1.
`${FIXTURE}` | The fixture's name.
`${TEST}` | The test's name.
`${USERAGENT}` | The combination of `${BROWSER}`, `${BROWSER_VERSION}`, `${OS}`, and `${OS_VERSION}` (separated by underscores).
`${BROWSER}` | The browser's name.
`${BROWSER_VERSION}` | The browser's version.
`${OS}` | The operation system's name.
`${OS_VERSION}` | The operation system's version.
`${TEST_ID}` | Resolves to `test-${TEST_INDEX}` if TestCafe can associate this screenshot or video with a specific test; resolves to an empty string otherwise (for instance, when a single video is recorded for the entire test run).
`${RUN_ID}` | Resolves to `run-${QUARANTINE_ATTEMPT}` for screenshots taken when [quarantine mode](../programming-interface/runner.md#quarantine-mode) is enabled; resolves to an empty string for videos and for screenshots taken when [quarantine mode](../programming-interface/runner.md#quarantine-mode) is disabled.