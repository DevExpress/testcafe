---
layout: docs
title: Create Faster Tests
permalink: /documentation/recipes/best-practices/create-faster-tests.html
redirect_from:
  - /documentation/recipes/create-faster-tests.html
---
# Create Faster Tests

Speed of TestCafe tests depends on the speed of your web application. To that end, make sure that your application doesn't load large payloads of unused CSS or scripts.

Test in an environment with performance overhead. Lack of resources can increase time the browser takes to initialize, connect to TestCafe and load the tested application. If you have to test in a resource-low environment, [Run Tests in Headless Browsers](#run-tests-in-headless-browsers).

----------------------------------

## Set Speed

TestCafe's [speed](../../reference/command-line-interface.md#--speed-factor) option allows you to change the test speed. The default value is `1`, which is the fastest. If your have `speed` set in the run configuration, remove this setting or set it to `1`.

----------------------------------

## Run Tests in Headless Browsers

Headless browsers take less time to initialize because they don't need to render the application. They also enable you to run tests in environments that lack GUI capabilities, like CI containers.

To run tests in a headless browser, use the `:headless` CLI parameter:

```sh
testcafe "chrome:headless" tests/
```

For more information, see [Test in Headless Mode](../../guides/concepts/browsers.md#test-in-headless-mode)

----------------------------------

## Use Roles for Login

If your tests require activity from logged in users, put Roles in the tests [beforeEach hook](../../reference/test-api/fixture/beforeeach.md).

With `Roles`, TestCafe remembers cookies associated with every logged in account. TestCafe reuses authentication data for that account during the test run and repeated logins happens instantly. 

When you switch Roles, TestCafe erases authentication data and you don't have to log out manually.

If your test covers logins on multiple websites, the active Role collects the authentication data from all these websites. When you switch to that Role later, you are logged in to all those websites.

You can use an [Anonymous Role](../../guides/advanced-guides/authentication.md#anonymous-role) to instantly log out of all accounts during a test.

For more info on Roles, see [User Roles](../../guides/advanced-guides/authentication.md#user-roles)

----------------------------------

[Remote browsers](../../guides/concepts/browsers.md#browsers-on-remote-devices) may take a long time to initialize and connect to TestCafe. Use the  [--browser-init-timeout](../../reference/command-line-interface.md#--browser-init-timeout-ms) to set a time limit for browsers to connect. If this timeout is exceeded, tests fail - it might be a good time to debug your browser connection.

----------------------------------

## Run Tests Concurrently

Tests may execute faster if run in parallel. In concurrent mode, TestCafe creates multiple instances of specified browsers and uses that pool of browser instances to run tests.

Use the [--concurency](../../reference/command-line-interface.md#-c-n---concurrency-n) CLI option to launch tests concurrently.

Make sure that your tests have as little unhandled promise rejections and uncaught errors as possible. If such an error happens during a test run, all tests that run concurrently fail.

For more info on concurrency, read [Run Tests Concurrently](../../guides/basic-guides/run-tests.md#run-tests-concurrently).

----------------------------------

# Optimize Your Page Model

[Page Model](../../guides/concepts/page-model.md) is a great way to structure your test suite. A couple points to keep in mind with page models.

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

In your test files, avoid the `new` keyword when creating page model instances and export the object instead:

```js
import myPage from 'path/to/page-model.js'
// a reccomended way to import page models


const myPage = new MyPage();
// NOT RECOMMENDED
// may lead to performance issues in large test suites
```

