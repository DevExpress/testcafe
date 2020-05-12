---
layout: docs
title: Screenshots and Videos
permalink: /documentation/guides/advanced-guides/screenshots-and-videos.html
redirect_from:
  - /documentation/using-testcafe/common-concepts/screenshots-and-videos.html
---
# Screenshots and Videos

TestCafe allows you to take screenshots of the tested webpage and record videos of test runs.

* [Screenshots](#screenshots)
  * [Prerequisites for Screenshots](#prerequisites-for-screenshots)
  * [Take Screenshots at Arbitrary Moments During Test Run](#take-screenshots-at-arbitrary-moments-during-test-run)
  * [Take Screenshots When a Test Fails](#take-screenshots-when-a-test-fails)
  * [Screenshot Options](#screenshot-options)
  * [Disable Screenshots](#disable-screenshots)
* [Record Videos](#record-videos)
  * [Prerequisites for Video Recording](#prerequisites-for-video-recording)
  * [Enable Video Recording](#enable-video-recording)
  * [Basic Video Options](#basic-video-options)
  * [Video Encoding Options](#video-encoding-options)
* [Screenshot and Video Directories](#screenshot-and-video-directories)
  * [Base Directory](#base-directory)
  * [Subdirectories and File Names](#subdirectories-and-file-names)
    * [Path Patterns](#path-patterns)
    * [Default Path Pattern](#default-path-pattern)
    * [Custom Path Patterns](#custom-path-patterns)
    * [Path Pattern Placeholders](#path-pattern-placeholders)

## Screenshots

TestCafe allows you to take screenshots of the tested webpage at any moment during test run, or automatically whenever a test fails.

> Important! Screenshots are not supported when you run tests in [remote browsers](../concepts/browsers.md#browsers-on-remote-devices).

### Prerequisites for Screenshots

Screenshots require .NET 4.0 or newer installed on Windows machines and an [ICCCM/EWMH-compliant window manager](https://en.wikipedia.org/wiki/Comparison_of_X_window_managers) on Linux.

### Take Screenshots at Arbitrary Moments During Test Run

You can take screenshots at any moment during test run. Use the [t.takeScreenshot](../../reference/test-api/testcontroller/takescreenshot.md) action to take a screenshot of the entire page, or the [t.takeElementScreenshot](../../reference/test-api/testcontroller/takeelementscreenshot.md) action to capture a particular element.

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

* the [takeOnFails](../../reference/command-line-interface.md#takeonfails) parameter in the `-s` (`--screenshots`) command line flag,

    ```sh
    testcafe chrome tests/sample-fixture.js -s takeOnFails=true
    ```

* the `takeOnFails` parameter of the [runner.screenshots](../../reference/testcafe-api/runner/screenshots.md) API method,

    ```js
    runner.screenshots({
        takeOnFails: true
    });
    ```

* the [screenshots.takeOnfails](../../reference/configuration-file.md#screenshotstakeonfails) configuration file property.

    ```json
    {
        "screenshots": {
            "takeOnFails": true
        }
    }
    ```

### Screenshot Options

TestCafe supports the following screenshot options:

Option | Type | Description | Default Value
------ | ---- | ----------- | --------------
`path` | String | The base directory where screenshots are saved. | `./screenshots`
`takeOnFails` | Boolean | `true` to take a screenshot whenever a test fails. | `false`
`pathPattern` | String | A pattern that defines how TestCafe composes the relative path to a screenshot file. See [Screenshot and Video Directories](#screenshot-and-video-directories). | See [Default Path Pattern](#default-path-pattern).
`fullPage` | String | `true` to capture the full page, including content that is not visible due to overflow. | `false`

You can specify screenshot options in either of the following ways:

* the [-s (--screenshots)](../../reference/command-line-interface.md#-s---screenshots-optionvalueoption2value2) command line flag,

    ```sh
    testcafe chrome test.js -s path=artifacts/screenshots,fullPage=true,pathPattern=${TEST_INDEX}/${USERAGENT}/${FILE_INDEX}.png
    ```

    > Enclose parameter values in quotes if they contain spaces. In Windows `cmd.exe` shell, use double quotes.

* the `options` parameter of the [runner.screenshots](../../reference/testcafe-api/runner/screenshots.md) API method,

    ```js
    runner.screenshots({
        path: 'artifacts/screenshots',
        fullPage: true,
        pathPattern: '${TEST_INDEX}/${USERAGENT}/${FILE_INDEX}.png'
    });
    ```

* the [screenshots](../../reference/configuration-file.md#screenshots) configuration file property.

    ```json
    {
        "screenshots": {
            "path": "artifacts/screenshots",
            "fullPage": true,
            "pathPattern": "${TEST_INDEX}/${USERAGENT}/${FILE_INDEX}.png"
        }
    }
    ```

### Disable Screenshots

You can prevent TestCafe from taking screenshots whenever a test fails or a [screenshot action](../../reference/test-api/testcontroller/takescreenshot.md) is executed. Use one of the following options:

* the [--disable-screenshots](../../reference/command-line-interface.md#--disable-screenshots) command line flag,

    ```sh
    testcafe chrome tests/sample-fixture.js --disable-screenshots
    ```

* the `disableScreenshots` option of the [runner.run](../../reference/testcafe-api/runner/run.md) API method,

    ```js
    runner.run({
        disableScreenshots: true
    });
    ```

* the [disableScreenshots](../../reference/configuration-file.md#disablescreenshots) configuration file property.

    ```json
    {
        "disableScreenshots": true
    }
    ```

## Record Videos

TestCafe allows you to record videos of test runs.

> Important! Video recording is supported in Google Chrome, Mozilla Firefox, and Microsoft Edge (Chromium-based). TestCafe cannot record videos when you run tests in [remote browsers](../concepts/browsers.md#browsers-on-remote-devices).

### Prerequisites for Video Recording

You should install [the FFmpeg library](https://ffmpeg.org/) to record videos.

Do one of the following if TestCafe cannot find the FFmpeg library:

* Add the FFmpeg installation directory to the system's `PATH` environment variable;
* Specify the path to the FFmpeg executable in the `FFMPEG_PATH` environment variable or the `ffmpegPath` parameter in [video options](#basic-video-options);
* Install the `@ffmpeg-installer/ffmpeg` package from npm.

Videos are saved in the `.mp4` format.

### Enable Video Recording

Use either of the following to enable video recording:

* the [--video](../../reference/command-line-interface.md#--video-basepath) command line flag,

    ```sh
    testcafe chrome test.js --video artifacts/videos
    ```

* the [runner.video](../../reference/testcafe-api/runner/video.md) API method,

    ```js
    runner.video('artifacts/videos');
    ```

* the [videoPath](../../reference/configuration-file.md#videopath) configuration file property.

    ```json
    {
        "videoPath": "artifacts/videos"
    }
    ```

You should provide the base path where TestCafe stores videos to this flag, method or property. See [Screenshot and Video Directories](#screenshot-and-video-directories) for more information.

TestCafe records all the tests and saves the recording of each test in a separate file. To change this behavior, use the `failedOnly` and `singleFile` [video options](#basic-video-options).

### Basic Video Options

TestCafe supports the following video options:

Option | Type | Description | Default Value
------ | ---- | ----------- | --------------
`failedOnly` | Boolean | `true` to record only failed tests; `false` to record all tests. | `false`
`singleFile` | Boolean | `true` to save the entire recording as a single file; `false` to create a separate file for each test. | `false`
`ffmpegPath` | String | The path to the FFmpeg codec executable. | Auto-detected
`pathPattern` | String | A pattern that defines how TestCafe composes the relative path to a video file. See [Screenshot and Video Directories](#screenshot-and-video-directories). | See [Default Path Pattern](#default-path-pattern).

You can specify video options in either of the following ways:

* the [--video-options](../../reference/command-line-interface.md#--video-options-optionvalueoption2value2) command line flag,

    ```sh
    testcafe chrome test.js --video artifacts/videos --video-options singleFile=true,failedOnly=true,pathPattern=${TEST_INDEX}/${USERAGENT}/${FILE_INDEX}.mp4
    ```

    > Enclose parameter values in quotes if they contain spaces. In Windows `cmd.exe` shell, use double quotes.

* the `options` parameter of the [runner.video](../../reference/testcafe-api/runner/video.md) API method,

    ```js
    runner.video('artifacts/videos', {
        singleFile: true,
        failedOnly: true,
        pathPattern: '${TEST_INDEX}/${USERAGENT}/${FILE_INDEX}.mp4'
    });
    ```

* the [videoOptions](../../reference/configuration-file.md#videooptions) configuration file property.

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

* the [--video-encoding-options](../../reference/command-line-interface.md#--video-encoding-options-optionvalueoption2value2) command line flag,

    ```sh
    testcafe chrome test.js --video artifacts/videos --video-encoding-options r=20,aspect=4:3
    ```

* the `encodingOptions` parameter of the [runner.video](../../reference/testcafe-api/runner/video.md) API method,

    ```js
    runner.video('artifacts/videos', { }, {
        r: 20,
        aspect: '4:3'
    });
    ```

* the [videoEncodingOptions](../../reference/configuration-file.md#videoencodingoptions) configuration file property.

    ```json
    {
        "videoEncodingOptions": {
            "r": 20,
            "aspect": "4:3"
        }
    }
    ```

## Screenshot and Video Directories

### Base Directory

**Screenshots**

The **default** base directory for screenshots is *\<project\>/screenshots*.

You can use the `path` [option](#screenshot-options) to specify a different base directory:

*CLI*

```sh
testcafe chrome test.js -s path=artifacts/screenshots
```

*API*

```js
runner.screenshots({
    path: 'artifacts/screenshots'
});
```

*Configuration file*

```json
{
    "screenshots": {
        "path": "artifacts/screenshots"
    }
}
```

**Videos**

The base directory for video files must be specified in order to [enable video recording](#enable-video-recording):

*CLI*

```sh
testcafe chrome test.js --video artifacts/videos
```

*API*

```js
runner.video('artifacts/videos');
```

*Configuration file*

```json
{
    "videoPath": "artifacts/videos"
}
```

### Subdirectories and File Names

Inside the base directory, screenshots and videos are organized into subdirectories and named according to the *path patterns*.

#### Path Patterns

A path pattern is a template for relative paths to individual screenshot or video files. The pattern uses [placeholders](#path-pattern-placeholders) to define positions where TestCafe should insert values like date, time or browser name.

The following example shows a path pattern for screenshot files:

```text
${DATE}_${TIME}/${BROWSER}/screenshot-${FILE_INDEX}.png
```

When TestCafe saves a screenshot or video file, it substitutes each placeholder with an actual value. For instance, the pattern shown above forms the following paths:

```text
2019-10-02_11-35-40/Chrome/screenshot-1.png
2019-10-02_11-35-40/Chrome/screenshot-2.png
2019-10-02_11-35-40/Firefox/screenshot-1.png
2019-10-02_11-35-40/Firefox/screenshot-2.png
```

You can use the [default](#default-path-pattern) or [custom path pattern](#custom-path-patterns).

> When you take a screenshot with the [t.takeScreenshot](../../reference/test-api/testcontroller/takescreenshot.md) or [t.takeElementScreenshot](../../reference/test-api/testcontroller/takeelementscreenshot.md) action, you can specify the exact file path. In this instance, TestCafe saves this screenshot to the specified location and does not use patterns.

#### Default Path Pattern

TestCafe composes paths to screenshots and videos according to the following pattern:

```sh
${DATE}_${TIME}/${TEST_ID}/${RUN_ID}/${USERAGENT}/${FILE_INDEX}.<ext>
```

where `<ext>` is `.png` for screenshots and `.mp4` for videos.

When TestCafe [takes a screenshot because a test fails](#take-screenshots-when-a-test-fails), it adds the `errors` subfolder to the pattern.

```sh
${DATE}_${TIME}/${TEST_ID}/${RUN_ID}/${USERAGENT}/errors/${FILE_INDEX}.png
```

#### Custom Path Patterns

You can create a custom [path pattern](#path-patterns) for screenshots and videos. Use [placeholders](#path-pattern-placeholders) to define which values should be used in relative paths.

To specify a custom pattern, use the `pathPattern` parameter in [screenshot](#screenshot-options) or [video](#basic-video-options) options.

```sh
testcafe chrome test.js -s pathPattern=${DATE}_${TIME}/test-${TEST_INDEX}/${USERAGENT}/${FILE_INDEX}.png
```

```js
runner.video('artifacts/videos', {
    pathPattern: '${DATE}_${TIME}/test-${TEST_INDEX}/${USERAGENT}/${FILE_INDEX}.mp4'
});
```

#### Path Pattern Placeholders

You can use the following placeholders in screenshot and video path patterns:

Placeholder | Description
----------- | ------------
`${DATE}` | The test run's start date (YYYY-MM-DD).
`${TIME}` | The test run's start time (HH-mm-ss).
`${TEST_INDEX}` | The test's index.
`${FILE_INDEX}` | The screenshot file's index.
`${QUARANTINE_ATTEMPT}` | The [quarantine](../basic-guides/run-tests.md#quarantine-mode) attempt's number. If the quarantine mode is disabled, the `${QUARANTINE_ATTEMPT}` placeholder's value is 1.
`${FIXTURE}` | The fixture's name.
`${TEST}` | The test's name.
`${USERAGENT}` | The combination of `${BROWSER}`, `${BROWSER_VERSION}`, `${OS}`, and `${OS_VERSION}` (separated by underscores).
`${BROWSER}` | The browser's name.
`${BROWSER_VERSION}` | The browser's version.
`${OS}` | The operation system's name.
`${OS_VERSION}` | The operation system's version.
`${TEST_ID}` | Resolves to `test-${TEST_INDEX}` if TestCafe can associate this screenshot or video with a specific test; resolves to an empty string otherwise (for instance, when a single video is recorded for the entire test run).
`${RUN_ID}` | Resolves to `run-${QUARANTINE_ATTEMPT}` for screenshots taken when [quarantine mode](../basic-guides/run-tests.md#quarantine-mode) is enabled; resolves to an empty string for videos and for screenshots taken when [quarantine mode](../basic-guides/run-tests.md#quarantine-mode) is disabled.
