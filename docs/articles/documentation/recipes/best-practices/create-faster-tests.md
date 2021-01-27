---
layout: docs
title: Create Faster Tests
permalink: /documentation/recipes/best-practices/create-faster-tests.html
redirect_from:
  - /documentation/recipes/create-faster-tests.html
---
# Speed Up Your Tests

## Run Tests Concurrently

Enable concurrent mode to run multiple browser instances simultaneously. This will speed up the testing process at the expense of higher resource consumption.

Use the [--concurency](../../reference/command-line-interface.md#-c-n---concurrency-n) CLI option to launch tests concurrently:

```sh
testcafe --concurency 3 chrome tests/
```

For more info on concurrency, read [Run Tests Concurrently](../../guides/basic-guides/run-tests.md#run-tests-concurrently).

## Run Tests in Headless Browsers

Run tests in headless browsers. Headless browsers take less time to initialize because they don't need to render the application. They also enable you to run tests in environments without graphical capabilities, such as CI containers.

For more information, see [Test in Headless Mode](../../guides/concepts/browsers.md#test-in-headless-mode)

## Use Roles for Login

Use [Roles](../../guides/advanced-guides/authentication.md#user-roles) to save time on user authentication.

Roles are user log-in routines. When you first enable a `Role`, TestCafe executes the routine and saves the user authentication data that it receives. When you activate the same role later, TestCafe loads the authentication data and skips the log-in process.

When you switch between `Roles`, TestCafe replaces your browser's existing authentication data with the new role's credentials.

Place your `Role` statements inside a [beforeEach hook](../../reference/test-api/fixture/beforeeach.md) to recall the authentication data before each of the tests in your fixture.

> Roles can access authentication data in cookie and browser storage. If your authentication system stores data elsewhere, roles may not work.

For more info on Roles, see [User Roles](../../guides/advanced-guides/authentication.md#user-roles)

## Set `speed`

TestCafe emulates real user actions on tested webpages. The [speed](../../reference/command-line-interface.md#--speed-factor) option enables you to change action emulation speed.

The highest value of `1` represents the fastest actions on the page. This is a default value. The minimum value of `0.01` represents a speed that is 100 lower. Setting a lower `speed` can be useful for debugging tests, but slows tests down.

If your tests have `speed` set in the run configuration, disable this setting or set it to `1`.

## Run Tests in Local Browsers

For better performance, launch tests in local browsers. Network latency negatively impacts test speed.

Test in an environment with performance headroom. Lack of resources may increase the time browsers take to initialize, connect to TestCafe and load the tested application. If you have to test in a low-resource environment, [run tests in headless browsers](#run-tests-in-headless-browsers).

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
