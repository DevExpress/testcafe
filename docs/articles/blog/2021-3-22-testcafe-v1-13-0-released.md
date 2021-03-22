---
layout: post
title: TestCafe v1.13.0 Released
permalink: /blog/:title.html
---
# TestCafe v1.13.0 Released

This release adds support for custom paths to the configuration file, support for Microsoft Edge on Linux systems, and multiple bugfixes.

<!--more-->

## Enhancements

### ⚙ Specify Custom Path to the TestCafe Configuration File ([PR #6035](https://github.com/DevExpress/testcafe/pull/6035) by [@Chris-Greaves](https://github.com/Chris-Greaves))

TestCafe now allows you to specify a custom path to the [configuration file](../documentation/reference/configuration-file.md).

To set the path, use one of the following options:

* the [--config-file CLI option](../documentation/reference/command-line-interface.md#--config-file-path)
* the [configFile option of the createTestCafe function](../documentation/reference/testcafe-api/global/createtestcafe.md#options)

### Add Support for Microsoft Edge on Linux ([PR testcafe-browser-tools/#210](https://github.com/DevExpress/testcafe-browser-tools/pull/210) by [@dcsaszar](https://github.com/dcsaszar))

If you have [Microsoft Edge installed on your Linux machine](https://www.microsoftedgeinsider.com/en-us/download?platform=linux-deb), you can now launch TestCafe tests in this browser.

```sh
testcafe edge tests/test.js
```

### ⚙ Deprecated the `t.setPageLoadTimeout` method ([PR #5979](https://github.com/DevExpress/testcafe/pull/5979))

Starting with v1.13.0, the [t.setPageLoadTimeout](../documentation/reference/test-api/testcontroller/setpageloadtimeout.md) method is deprecated. To set the page load timeout, use the new [test.timeouts](../documentation/reference/test-api/test/timeouts.md) method.

```js
fixture`Setting Timeouts`
    .page`http://devexpress.github.io/testcafe/example`;

test
    .timeouts({
        pageLoadTimeout: 2000
    })
    ('My test', async t => {
        //test actions
    })
```

You can also use `test.timeouts` to set the [pageRequestTimeout](../documentation/reference/configuration-file.md#pagerequesttimeout) and [ajaxRequestTimeout](../documentation/reference/configuration-file.md#ajaxrequesttimeout) as well.

```js
fixture`Setting Timeouts`
    .page`http://devexpress.github.io/testcafe/example`;

test
    .timeouts({
        pageLoadTimeout:    2000,
        pageRequestTimeout: 60000,
        ajaxRequestTimeout: 60000
    })
    ('My test', async t => {
        //test actions
    })
```

## Bug Fixes

* Fixed a bug where TestCafe would sometimes be unable to trigger a `hover` event on a `radio` element ([#5916](https://github.com/DevExpress/testcafe/issues/5916))
* Fixed a bug where TestCafe was unable to register a Service Worker due to the wrong `currentScope` calculation inside a `Window.postMessage` call ([testcafe-hammerhead/#2524](https://github.com/DevExpress/testcafe-hammerhead/issues/2524))
* `RequestLogger` now shows a correct protocol for WebSocket requests ([testcafe-hammerhead/#2591](https://github.com/DevExpress/testcafe-hammerhead/issues/2591))
* Test execution now pauses when the browser window is in the background ([testcafe-browser-tools/#158](https://github.com/DevExpress/testcafe-browser-tools/issues/158))
* TestCafe now appends an extension to screenshot filenames ([#5103](https://github.com/DevExpress/testcafe/issues/5103))
* Fixed a bug where TestCafe would emit test action events after the end of a test run ([#5650](https://github.com/DevExpress/testcafe/issues/5650))
* TestCafe now closes if the `No tests to run` error occurs in Live mode ([#4257](https://github.com/DevExpress/testcafe/issues/4257))
* Fixed a freeze that happened when you run a test suite with skipped tests ([#4967](https://github.com/DevExpress/testcafe/issues/4967))
* Fixed an error where a `documentElement.transform.translate` call moved the TestCafe UI in the browser window ([#5606](https://github.com/DevExpress/testcafe/issues/5606))
* TestCafe now emits a warning if you pass an unawaited selector to an assertion ([#5554](https://github.com/DevExpress/testcafe/issues/5554))
* Fixed a crash that sometimes occurred in Chrome v85 and earlier on pages with scripts ([PR testcafe-hammerhead/#2590](https://github.com/DevExpress/testcafe-hammerhead/pull/2590))
