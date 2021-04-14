---
layout: docs
redirect_to: https://testcafe.io/documentation/402963/guides/advanced-guides/speed-up-test-execution
title: Create Faster Tests
permalink: /documentation/guides/advanced-guides/speed-up-test-execution.html
---

# Speed Up Test Execution

This article consists of the following sections that describe how to decrease the execution time of TestCafe tests:

* [Run Tests Concurrently](#run-tests-concurrently)
* [Run Tests in Headless Browsers](#run-tests-in-headless-browsers)
* [Use Roles for Login](#use-roles-for-login)
* [Set Test Speed](#set-test-speed)
* [Run Tests in Local Browsers](#run-tests-in-local-browsers)
* [Mock Requests](#mock-requests)
* [Optimize Your Page Model](#optimize-your-page-model)
* [Enable Server-Side Caching](#enable-server-side-caching)

## Run Tests Concurrently

Enable concurrent mode to run multiple browser instances simultaneously.

You can enable concurrency with the [concurrency](../../reference/configuration-file.md#concurrency) configuration file property:

```json
{
  "concurrency": 3
}
```

In CLI, use the [--concurrency](../../reference/command-line-interface.md#-c-n---concurrency-n) option:

```sh
testcafe --concurrency 3 chrome tests/
```

With `concurrency` enabled, TestCafe runs tests in parallel, which may decrease execution time of your test suite, but requires more resources from the test environment. Choose the option value based on the test environment performance.

For more information on concurrency, read [Run Tests Concurrently](../../guides/basic-guides/run-tests.md#run-tests-concurrently).

## Run Tests in Headless Browsers

Headless browsers take less time to initialize because they do not have a GUI. They also enable you to run tests in containers and other environments without graphic capabilities.

For more information, see [Test in Headless Mode](../../guides/concepts/browsers.md#test-in-headless-mode)

## Use Roles for Login

Use [Roles](../../guides/advanced-guides/authentication.md#user-roles) for user authentication.

Roles are user log-in routines. When you first enable a `Role`, TestCafe executes the routine and saves the user authentication data. When you activate the same role again, TestCafe loads the authentication data and skips the log-in happens much faster.

When you switch between `Roles`, TestCafe replaces your browser's existing authentication data with the new role's credentials.

Place your `Role` statements inside a [beforeEach hook](../../reference/test-api/fixture/beforeeach.md) to recall the authentication data before each test in your fixture.

> Roles use authentication data from cookies, `sessionStorage` and `localStorage` only. If your authentication system stores data elsewhere, roles may not work.

For more information on Roles, see [User Roles](../../guides/advanced-guides/authentication.md#user-roles)

## Set Test Speed

TestCafe emulates real user actions on tested webpages. The [speed](../../reference/command-line-interface.md#--speed-factor) option controls the emulation speed.

A value of `1` represents the fastest emulation speed. This is the default `speed` value. A lower `speed` can be useful for debugging because it allows you to watch emulated actions on a screen, but it slows tests down.

If you set a custom `speed` value in the run configuration, disable this setting or set it to `1`.

## Run Tests in Local Browsers

For better performance, launch tests in local browsers. Network latency caused by remote browsers negatively impacts test speed.

## Mock Requests

You can mock the responses of time-consuming HTTP requests to speed up the testing process.

TestCafe [request mocker](../../reference/test-api/requestmock/README.md) intercepts your application's requests to external resources, and responds with the data that you specify. A mocked request is resolved almost instantly, and eliminates possible delays caused by data processing and network latency.

For instructions on how to mock requests, refer to the [Mock HTTP Requests](../../guides/advanced-guides/intercept-http-requests.md#mock-http-requests) article.

## Optimize Your Page Model

In your page model file create and export an instance of the page model class.

**PageModel.js**

```js
class PageModel {
    //page model contents
}

export default new PageModel()
```

**test.js**

```js
import PageModel from 'path/to/page-model.js'
```

This approach ensures that the page model object is created only once per test run.

> Important! If you export the page model class and create an instance in every test file, JavaScript creates a new page object for each test file. This increases test execution time and memory consumption.

For more on page models, read [Page Model](../../guides/concepts/page-model.md).

## Enable Server-Side Caching

> Important! Support for server-side caching is **experimental**.
>
> Do not use caching if you run into compatibility issues with your tests.

The TestCafe proxy can cache webpage assets (stylesheets, scripts, images) and retrieve them from its cache when it accesses the webpage again.

You can enable caching in one of the following ways:

* [--cache](../../reference/command-line-interface.md#--cache) CLI option

  ```sh
  testcafe chrome my-tests/ --cache
  ```

* [cache](../../reference/configuration-file.md#cache) configuration file property

  ```json
  {
  "cache": true
  }
  ```

* [cache](../../reference/testcafe-api/runner/run.md) API option

  ```js
  runner.run({ cache: true });
  ```

Enable server-side caching to decrease test duration, particularly when your application relies on browser caching.

> The `cache` option doesn't cache HTML page content and assets heavier than 5 MB.
