---
layout: docs
title: Create Faster Tests
permalink: /documentation/recipes/best-practices/create-faster-tests.html
redirect_from:
  - /documentation/recipes/create-faster-tests.html
---
# Speed Up Your Tests

The speed of TestCafe tests depends on the loading speed of your web application. The best way to speed up your tests may be to optimize the tested application. Make sure that your application doesn't load large payloads of unused CSS or scripts.

Test in an environment with performance headroom. Lack of resources may increase the time browsers take to initialize, connect to TestCafe and load the tested application. If you have to test in a resource-low environment, [run tests in headless browsers](#run-tests-in-headless-browsers).

For better performance, launch tests in local browsers. Network lag between TestCafe and remote browsers causes delays in test execution.

Remote browsers may take a long time to initialize and connect to TestCafe. Use the  [--browser-init-timeout](../../reference/command-line-interface.md#--browser-init-timeout-ms) CLI option to set a time limit for browsers to connect. Tests fail if this timeout is exceeded - it might be a good time to debug your remote browser connection.

TestCafe's [speed](../../reference/command-line-interface.md#--speed-factor) option allows you to change test speed. The default value is `1`, which is fastest.
If your tests have `speed` set in the run configuration, disable this setting or set it to `1`.

## Run Tests in Headless Browsers

Run tests in headless browsers. Headless browsers take less time to initialize because they don't need to render the application to a GUI. They also enable you to run tests in environments that lack GUI capabilities, like CI containers.

To run tests in a headless browser, use the `:headless` CLI parameter:

```sh
testcafe "chrome:headless" tests/
```

For more information, see [Test in Headless Mode](../../guides/concepts/browsers.md#test-in-headless-mode)

## Use Roles for Login

If your tests require activity from logged in users, use [Roles](../../guides/advanced-guides/authentication.md#user-roles) for authentication.

Put Roles in the [beforeEach hook](../../reference/test-api/fixture/beforeeach.md) of your test suite: following tests in a suite reuse authentication data and authentication happens instantly.

With `Roles`, TestCafe remembers cookies associated with every logged-in account. When you switch Roles, TestCafe erases authentication data and you don't have to log out manually.

If your test covers logins on multiple websites, the active Role collects the authentication data from all these websites. When you switch to that Role later, you are logged in to all these websites.

Use an [Anonymous Role](../../guides/advanced-guides/authentication.md#anonymous-role) to instantly log out of all accounts during a test.

> Roles can access authentication data in cookie and browser storage. If your authentication system stores data elsewhere, you may not be able to use roles.

For more info on Roles, see [User Roles](../../guides/advanced-guides/authentication.md#user-roles)

## Run Tests Concurrently

Tests execute faster if run concurrently. In concurrent mode, TestCafe creates multiple instances of specified browsers and uses that browser pool to run tests.

Use the [--concurency](../../reference/command-line-interface.md#-c-n---concurrency-n) CLI option to launch tests concurrently:

```sh
testcafe --concurency 3 chrome tests/
```

For more info on concurrency, read [Run Tests Concurrently](../../guides/basic-guides/run-tests.md#run-tests-concurrently).

## Mock Requests

A tested application may interact with remote resources (for example, an analytics service or a database). Requests to such resources may create delays in test suite execution. To avoid such delays, you can mock requests to these resources.

TestCafe [request mocker](../../reference/test-api/requestmock/README.md) intercepts requests from your app to external resources and responds with data that you specify. A mocked request is resolved almost instantly, which eliminates a possible delay caused by a foreign resource or network lag.

For more information about mocking requests, visit [Mock HTTP Requests](../../guides/advanced-guides/intercept-http-requests.md#mock-http-requests).

## Optimize Your Page Model

Page model is a great way to structure your test suite. However, wrong page model structure can increase testing time in large test suites.

In your page model file, do not export the page model constructor, but create and export a new instance.

```js
import { Selector } from 'testcafe';
import { t } from 'testcafe';

class MyPage {
    //page model contents here
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
