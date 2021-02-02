---
layout: docs
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

## Run Tests Concurrently

Enable concurrent mode to run multiple browser instances simultaneously.

You can enable concurrency with the [concurrency](../../reference/configuration-file.md#concurrency) configuration file property:

```json
{
  "concurrency": 3
}
```

In CLI, use the [--concurency](../../reference/command-line-interface.md#-c-n---concurrency-n) option:

```sh
testcafe --concurency 3 chrome tests/
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

Learn how to mock requests in the [Mock HTTP Requests](../../guides/advanced-guides/intercept-http-requests.md#mock-http-requests) article.

## Optimize Your Page Model

A well-structured page model can improve your test suite's readability and performance. However, an improper page model structure can increase testing time in large test suites.

Do not export the page model class from your page model file. Create a new page model instance and export that instance.

```js
import { Selector } from 'testcafe';
import { t } from 'testcafe';

class MyPage {
    //page model contents
}

export default new MyPage()
// creates an instance of MyPage
// that can be imported in tests
```

Don't use the `new` keyword to create page model instances in your test files. Import the page object instead:

```js
import myPage from 'path/to/page-model.js'
// a recommended way to import page models


//
const myPage = new MyPage();
// NOT RECOMMENDED
// may lead to performance issues in large test suites
```

For more on page models, read [Page Model](../../guides/concepts/page-model.md).
