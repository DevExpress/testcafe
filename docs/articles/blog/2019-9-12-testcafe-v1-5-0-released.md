---
layout: post
title: TestCafe v1.5.0 Released
permalink: /blog/:title.html
---
# TestCafe v1.5.0 Released

This release introduces the capability to disable page caching in TestCafe.

<!--more-->

## Enhancements

### ⚙ Page Caching Can be Disabled ([#3780](https://github.com/DevExpress/testcafe/issues/3780))

TestCafe may be unable to log in to the tested website correctly if the web server uses caching for authentication pages or pages to which users are redirected after login. See the [User Roles](../documentation/guides/advanced-guides/authentication.md#test-actions-fail-after-authentication) topic for details.

If tests fail unexpectedly after authentication, disable page caching in TestCafe.

Use the [fixture.disablePageCaching](../documentation/reference/test-api/fixture/disablepagecaching.md) and [test.disablePageCaching](../documentation/reference/test-api/test/disablepagecaching.md) methods to disable caching during a particular fixture or test.

```js
fixture
    .disablePageCaching `My fixture`
    .page `https://example.com`;
```

```js
test
    .disablePageCaching
    ('My test', async t => { /* ... */ });
```

To disable page caching during the entire test run, use either of the following options:

* the [--disable-page-caching](../documentation/reference/command-line-interface.md#--disable-page-caching) command line flag

    ```sh
    testcafe chrome my-tests --disable-page-caching
    ```

* the `disablePageCaching` option in the [runner.run](../documentation/reference/testcafe-api/runner/run.md) method

    ```js
    runner.run({ disablePageCaching: true });
    ```

* the [disablePageCaching](../documentation/reference/configuration-file.md#disablepagecaching) configuration file property

    ```json
    {
        "disablePageCaching": true
    }
    ```

If tests run correctly without page caching, we recommend that you adjust the server settings to disable caching for authentication pages and pages to which the server redirects from them.

## Bug Fixes

* Fixed an error that occured when a selector matched an `<svg>` element ([#3684](https://github.com/DevExpress/testcafe/issues/3684))
* Fixed an issue when the `reporter` configuration file option was not applied ([#4234](https://github.com/DevExpress/testcafe/issues/4234))
* Fixed a warning message about invalid `tsconfig.json` file ([#4154](https://github.com/DevExpress/testcafe/issues/4154))
* `LiveRunner.stop()` now closes the browsers ([#4107](https://github.com/DevExpress/testcafe/issues/4107))
* Quarantined tests now re-run correctly in live mode ([#4093](https://github.com/DevExpress/testcafe/issues/4093))
* Fixed a bug when client scripts were not injected in live mode when it re-executed tests ([#4183](https://github.com/DevExpress/testcafe/issues/4183))
* `form.elements.length` now returns the correct value for forms with file inputs ([testcafe-hammerhead/#2034](https://github.com/DevExpress/testcafe-hammerhead/issues/2034))
* Fixed a bug when images were not displayed in inputs with the `image` type ([testcafe-hammerhead/#2116](https://github.com/DevExpress/testcafe-hammerhead/issues/2116))
* Fixed an AngularJS compatibility issue that caused a `TypeError` ([testcafe-hammerhead/#2099](https://github.com/DevExpress/testcafe-hammerhead/issues/2099))
* TestCafe now works correctly with servers that use `JSZip` to unpack uploaded files ([testcafe-hammerhead/#2115](https://github.com/DevExpress/testcafe-hammerhead/issues/2115))
