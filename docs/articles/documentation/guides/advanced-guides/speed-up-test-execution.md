---
layout: docs
title: Create Faster Tests
permalink: /documentation/guides/advanced-guides/speed-up-test-execution.html
---

# Speed Up Test Execution

This article describes ways to decrease the execution time of TestCafe tests. It includes the following sections:

* [Run Tests Concurrently](#run-tests-concurrently)
* [Run Tests in a Performant Environment](#run-tests-in-a-performant-environment)
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

For more info on concurrency, read [Run Tests Concurrently](../../guides/basic-guides/run-tests.md#run-tests-concurrently).

## Run Tests in a Performant Environment

Test in an environment with performance headroom. Lack of resources may increase the time browsers take to initialize, connect to TestCafe and load the tested application. If you have to test in a low-resource environment, [run tests in headless browsers](#run-tests-in-headless-browsers).

## Run Tests in Headless Browsers

Headless browsers take less time to initialize because they lack a GUI. They also enable you to run tests in containers and other environments without graphical capabilities.

For more information, see [Test in Headless Mode](../../guides/concepts/browsers.md#test-in-headless-mode)

## Use Roles for Login

Use [Roles](../../guides/advanced-guides/authentication.md#user-roles) to save time on user authentication.

Roles are user log-in routines. When you first enable a `Role`, TestCafe executes the routine and saves the user authentication data that it receives. When you activate the same role later, TestCafe loads the authentication data and skips the log-in process.

When you switch between `Roles`, TestCafe replaces your browser's existing authentication data with the new role's credentials.

Place your `Role` statements inside a [beforeEach hook](../../reference/test-api/fixture/beforeeach.md) to recall the authentication data before each of the tests in your fixture.

> Roles use authentication data from cookies, `sessionStorage` and `localStorage` only. If your authentication system stores data elsewhere, roles may not work.

For more info on Roles, see [User Roles](../../guides/advanced-guides/authentication.md#user-roles)

## Set Test Speed

TestCafe emulates real user actions on tested webpages. Set the [speed](../../reference/command-line-interface.md#--speed-factor) option to change the emulation speed.

The highest value of `1` represents the fastest possible emulation speed. This is the default `speed` value. Setting a lower `speed` can be useful for debugging, but it slows tests down.

If you set a custom `speed` value in the run configuration, disable this setting or set it to `1`.

## Run Tests in Local Browsers

For better performance, launch tests in local browsers. Network latency caused by remote browsers negatively impacts test speed.

## Mock Requests

You can mock the responses of time-consuming HTTP requests to speed up the testing process.

TestCafe [request mocker](../../reference/test-api/requestmock/README.md) intercepts your application's requests to external resources, and responds with the data that you specify. A mocked request is resolved almost instantly, which eliminates a possible delay caused by data processing and network latency.

For more information about mocking requests, visit [Mock HTTP Requests](../../guides/advanced-guides/intercept-http-requests.md#mock-http-requests).

## Optimize Your Page Model

Page model is a great way to structure your test suite. However, improper page model structure can increase testing time in large test suites.

In your page model file, do not export the page model class. Create a new page model instance and export that instance.

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

In your test files, avoid the `new` keyword when creating page model instances. Import the page object instead:

```js
import myPage from 'path/to/page-model.js'
// a recommended way to import page models


//
const myPage = new MyPage();
// NOT RECOMMENDED
// may lead to performance issues in large test suites
```

For more on page models, read [Page Model](../../guides/concepts/page-model.md).
