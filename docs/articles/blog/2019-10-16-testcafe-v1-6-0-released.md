---
layout: post
title: TestCafe v1.6.0 Released
permalink: /blog/:title.html
---
# TestCafe v1.6.0 Released

This release adds support for macOS 10.15 Catalina, introduces full-page screenshots and compound screenshot options.

<!--more-->

## 🌟 Support for macOS 10.15 Catalina

This version provides compatibility with macOS 10.15. Update TestCafe to v1.6.0 if you run macOS Catalina.

## Enhancements

### ⚙ Full-Page Screenshots ([#1520](https://github.com/DevExpress/testcafe/issues/1520))

TestCafe can now take screenshots that show the full page, including content that is not visible due to overflow.

Enable the `fullPage` option in CLI, API or configuration file to capture the full page on all screenshots. You can also pass this option to `t.takeScreenshot` to capture a single full-page screenshot.

*Command line interface*

Enable the [fullPage](../documentation/reference/command-line-interface.md#fullpage) parameter of the [-s (--screenshots)](../documentation/reference/command-line-interface.md#-s---screenshots-optionvalueoption2value2) flag:

```sh
testcafe chrome test.js -s fullPage=true
```

*API*

Pass the `fullPage` option to [runner.screenshots](../documentation/reference/testcafe-api/runner/screenshots.md):

```js
runner.screenshots({
    fullPage: true
});
```

*Configuration file*

Set the [screenshots.fullPage](../documentation/reference/configuration-file.md#screenshotsfullpage) property:

```json
{
    "screenshots": {
        "fullPage": true
    }
}
```

*Test code*

Pass the `fullPage` option to the [t.takeScreenshot](../documentation/reference/test-api/testcontroller/takescreenshot.md) action:

```js
t.takeScreenshot({
    fullPage: true
});
```

### ⚙ Compound Screenshot Options

The command line interface and configuration file schema have been updated to provide a more concise way to specify the screenshot options.

> TestCafe v1.6.0 also supports the existing options to maintain backward compatibility. However, these options are now marked *obsolete* in the documentation. In the future updates, we will deprecate them and emit warnings.

*Command line interface*

Screenshot options in CLI are now consolidated under the [-s (--screenshots)](../documentation/reference/command-line-interface.md#-s---screenshots-optionvalueoption2value2) flag in an `option=value` string:

```sh
testcafe chrome test.js -s takeOnFails=true,pathPattern=${DATE}_${TIME}/${FILE_INDEX}.png
```

Old Usage                                      | New Usage
---------------------------------------------- | -----------
`-s artifacts/screenshots`                     | `-s path=artifacts/screenshots`
`-S`, `--screenshots-on-fails`                 | `-s takeOnFails=true`
`-p ${DATE}_${TIME}/${FILE_INDEX}.png`         | `-s pathPattern=${DATE}_${TIME}/${FILE_INDEX}.png`

*Configuration file*

Configuration file properties that specify screenshot options are now combined in the [screenshots](../documentation/reference/configuration-file.md#screenshots) object:

```json
{
    "screenshots": {
        "path": "artifacts/screenshots",
        "takeOnFails": true,
        "pathPattern": "${DATE}_${TIME}/${FILE_INDEX}.png"
    }
}
```

Old Property             | New Property
------------------------ | ----------------------------
`screenshotPath`         | `screenshots.path`
`takeScreenshotsOnFails` | `screenshots.takeOnFails`
`screenshotPathPattern`  | `screenshots.pathPattern`

### ⚙ Default Screenshot Directory

TestCafe now saves the screenshots to `./screenshots` if the base directory is not specified.

The [--screenshots](../documentation/reference/command-line-interface.md#-s---screenshots-optionvalueoption2value2) CLI flag, the [runner.screenshots](../documentation/reference/testcafe-api/runner/screenshots.md) method or the [screenshotPath](../documentation/reference/configuration-file.md#screenshotpath) configuration option are not required to take screenshots. For instance, you can run TestCafe with no additional parameters and use the [t.takeScreenshot](../documentation/reference/test-api/testcontroller/takescreenshot.md) action in test code:

```sh
testcafe chrome test.js
```

*test.js*

```js
fixture `My fixture`
    .page `https://example.com`;

test('Take a screenshot', async t => {
    await t.takeScreenshot();
});
```

The `path` argument in [runner.screenshots](../documentation/reference/testcafe-api/runner/screenshots.md) is now optional.

```js
runner.screenshots({
    takeOnFails: true
});
```

### ⚙ New Option to Disable Screenshots

We have added an option that allows you to disable taking screenshots. If this option is specified, TestCafe does not take screenshots when a test fails and when the [t.takeScreenshot](../documentation/reference/test-api/testcontroller/takescreenshot.md) or [t.takeElementScreenshot](../documentation/reference/test-api/testcontroller/takeelementscreenshot.md) action is executed.

You can disable screenshots with a command line, API or configuration file option:

* the [--disable-screenshots](../documentation/reference/command-line-interface.md#--disable-screenshots) command line flag

    ```sh
    testcafe chrome my-tests --disable-screenshots
    ```

* the `disableScreenshots` option in the [runner.run](../documentation/reference/testcafe-api/runner/run.md) method

    ```js
    runner.run({ disableScreenshots: true });
    ```

* the [disableScreenshots](../documentation/reference/configuration-file.md#disablescreenshots) configuration file property

    ```json
    {
        "disableScreenshots": true
    }
    ```

## Bug Fixes

* Fixed an error thrown when you pass the `-b` command line flag ([#4294](https://github.com/DevExpress/testcafe/issues/4294))
* TestCafe no longer hangs when Firefox downloads a file ([#2741](https://github.com/DevExpress/testcafe/issues/2741))
* You can now start tests from TypeScript code executed with `ts-node` ([#4276](https://github.com/DevExpress/testcafe/issues/4276))
* Fixed TypeScript definitions for client script injection API ([PR #4272](https://github.com/DevExpress/testcafe/pull/4272))
* Fixed TypeScript definitions for `disablePageCaching` ([PR #4274](https://github.com/DevExpress/testcafe/pull/4274))
* Fixed a bug when anchor links did not navigate to their target destinations ([testcafe-hammerhead/#2080](https://github.com/DevExpress/testcafe-hammerhead/issues/2080))
