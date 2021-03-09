---
layout: post
title: TestCafe v1.11.0 Released
permalink: /blog/:title.html
---
# TestCafe v1.11.0 Released

This version brings the release of multiple browser windows mode, options to configure request timeouts and many bugfixes.

<!--more-->

## Enhancements

### Multiple Browser Windows is Live ([#912](https://github.com/DevExpress/testcafe/issues/912))

Testing in multiple browser windows is now stable.

To take full advantage of testing in multiple windows with TestCafe, read [Multiple Browser Windows](https://devexpress.github.io/testcafe/documentation/guides/advanced-guides/multiple-browser-windows.html).

### ⚙ Set Request Timeouts ([PR #5692](https://github.com/DevExpress/testcafe/pull/5692))

TestCafe now enables you to set request timeouts. If TestCafe receives no response within the specified period, it throws an error.

*CLI*

* [--ajax-request-timeout](../documentation/reference/command-line-interface.md#--ajax-request-timeout-ms) controls the timeout for fetch/XHR requests
* [--page-request-timeout](../documentation/reference/command-line-interface.md#--page-request-timeout-ms) sets the timeout for webpage requests

```sh
testcafe chrome my-tests --ajax-request-timeout 40000 --page-request-timeout 8000
```

*Configuration file*

* [ajaxRequestTimeout](../documentation/reference/configuration-file.md#ajaxrequesttimeout)
* [pageRequestTimeout](../documentation/reference/configuration-file.md#pagerequesttimeout)

```json
{
    "pageRequestTimeout": 8000,
    "ajaxRequestTimeout": 40000
}
```

*JavaScript API*

These options are available in the [runner.run Method](../documentation/reference/testcafe-api/runner/run.md).

```js
const createTestCafe = require('testcafe');
const testcafe = await createTestCafe('localhost', 1337, 1338);
try {
    const runner = testcafe.createRunner();
    const failed = await runner.run({
        pageRequestTimeout: 8000,
        ajaxRequestTimeout: 40000
    });
    console.log('Tests failed: ' + failed);
}
finally {
    await testcafe.close();
}
```

### ⚙ Set Browser Initialization Timeout ([PR #5720](https://github.com/DevExpress/testcafe/pull/5720))

This release introduces an option to control browser initialization timeout. This timeout controls the time browsers have to connect to TestCafe before an error is thrown. You can control this timeout in one of the following ways:

* [--browser-init-timeout](../documentation/reference/command-line-interface.md#--browser-init-timeout-ms) CLI option

```sh
testcafe chrome my-tests --browser-init-timeout 180000
```

* [browserInitTimeout](../documentation/reference/configuration-file.md#browserinittimeout) configuration option

```json
{
    "browserInitTimeout": 180000
}
```

* [runner.run Method](../documentation/reference/testcafe-api/runner/run.md) parameter

```js
runner.run({ "browserInitTimeout": 180000 })
```

This setting sets an equal timeout for local and [remote browsers](../documentation/guides/concepts/browsers.md#browsers-on-remote-devices).

### Improved `Unable To Establish Browser Connection` Error Message ([PR #5720](https://github.com/DevExpress/testcafe/pull/5720))

TestCafe raises this error when at least one local or remote browser was not able to connect. The error message now includes the number of browsers that have not established a connection.

TestCafe raises a warning if low system performance is causing the connectivity issue.

### ⚙ An Option to Retry Requests for the Test Page ([PR #5738](https://github.com/DevExpress/testcafe/pull/5738))

If a tested webpage was not served after the first request, TestCafe can now retry the request.

You can enable this functionality with a command line, API, or configuration file option:

* the [--retry-test-pages](../documentation/reference/command-line-interface.md#--retry-test-pages) command line argument

    ```sh
    testcafe chrome test.js --retry-test-pages
    ```

* the [createTestCafe](../documentation/reference/testcafe-api/global/createtestcafe.md) function parameter

    ```js
    const createTestCafe = require('testcafe');

    const testcafe = await createTestCafe('localhost', 1337, 1338, retryTestPages)
    ```

* the [retryTestPages](../documentation/reference/configuration-file.md#retrytestpages) configuration file property

    ```json
    {
        "retryTestPages": true
    }
    ```

## Bug Fixes

* Fixed a bug where `Selector.withText` couldn't locate elements inside an `iframe` ([#5886](https://github.com/DevExpress/testcafe/issues/5886))
* Fixed a bug where TestCafe was sometimes unable to detect when a browser instance closes ([#5857](https://github.com/DevExpress/testcafe/issues/5857))
* You can now install TestCafe with `Yarn 2` ([PR #5872](https://github.com/DevExpress/testcafe/pull/5872) by [@NiavlysB](https://github.com/NiavlysB))
* Fixed a bug where the `typeText` action does not always replace existing text ([PR #5942](https://github.com/DevExpress/testcafe/pull/5942) by [@rueyaa332266](https://github.com/rueyaa332266))
* Fixed a bug where TestCafe was sometimes unable to create a `Web Worker` from an object ([testcafe-hammerhead/#2512](https://github.com/DevExpress/testcafe-hammerhead/issues/2512))
* Fixed an error thrown by TestCafe proxy when trying to delete an object property that does not exist ([testcafe-hammerhead/#2504](https://github.com/DevExpress/testcafe-hammerhead/issues/2504))
* Fixed an error thrown by TestCafe proxy when a Service Worker overwrites properties of a `window` object ([testcafe-hammerhead/#2538](https://github.com/DevExpress/testcafe-hammerhead/issues/2538))
* Fixed a bug where `t.openWindow` method requested a URL twice ([testcafe-hammerhead/#2544](https://github.com/DevExpress/testcafe-hammerhead/issues/2544))
* Fixed an error (`TypeError: Illegal invocation`) thrown by TestCafe on pages that contain an XMLDocument with an `iframe` ([testcafe-hammerhead/#2554](https://github.com/DevExpress/testcafe-hammerhead/issues/2554))
* Fixed an error (`SyntaxError: Identifier has already been declared`) thrown by TestCafe on pages with scripts that create nested JavaScript objects ([testcafe-hammerhead/#2506](https://github.com/DevExpress/testcafe-hammerhead/issues/2506))
* Fixed a bug where TestCafe was unable to focus elements within shadow DOM ([testcafe-hammerhead/#2408](https://github.com/DevExpress/testcafe-hammerhead/issues/2408))
* TestCafe now throws an error when an entity of type other than `Error` is thrown in a test script ([PR testcafe-hammerhead/#2536](https://github.com/DevExpress/testcafe-hammerhead/pull/2536))
* Fixed a bug where TestCafe was sometimes unable to resolve relative URLs ([testcafe-hammerhead/#2399](https://github.com/DevExpress/testcafe-hammerhead/issues/2399))
* Properties of `window.location.constructor` are now shadowed correctly by TestCafe proxy ([testcafe-hammerhead/#2423](https://github.com/DevExpress/testcafe-hammerhead/issues/2423))
* TestCafe proxy now correctly handles requests that are not permitted by the CORS policy ([testcafe-hammerhead/#1263](https://github.com/DevExpress/testcafe-hammerhead/issues/1263))
* Improved compatibility with test pages that use `with` statements ([testcafe-hammerhead/#2434](https://github.com/DevExpress/testcafe-hammerhead/issues/2434))
* TestCafe proxy can now properly parse statements that use a comma operator in `for..of` loops ([testcafe-hammerhead/#2573](https://github.com/DevExpress/testcafe-hammerhead/issues/2573))
* Fixed a bug where TestCafe would open a new window even if `preventDefault` is present in element's event handler ([testcafe-hammerhead/#2582](https://github.com/DevExpress/testcafe-hammerhead/pull/2582))  

## Vulnerability Fix ([PR #5843](https://github.com/DevExpress/testcafe/pull/5843), [PR testcafe-hammerhead#2531](https://github.com/DevExpress/testcafe-hammerhead/pull/2531))

We have fixed a vulnerability found in the [debug](https://www.npmjs.com/package/debug) module we use for debugging.
The vulnerability was a [ReDos Vulnerability Regression](https://github.com/visionmedia/debug/issues/797) that affected all TestCafe users. TestCafe now uses `debug@4.3.1`, where the issue is fixed.
