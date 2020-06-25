---
layout: post
title: TestCafe v0.22.0 Released
permalink: /blog/:title.html
---
# TestCafe v0.22.0 Released

Write tests in CoffeeScript, view failed selector methods in test run reports and detect server-side errors and unhandled promise rejections.

<!--more-->

## Enhancements

### ⚙ CoffeeScript Support ([#1556](https://github.com/DevExpress/testcafe/issues/1556)) by [@GeoffreyBooth](https://github.com/GeoffreyBooth)

TestCafe now allows you to write tests in CoffeeScript. You do not need to compile CoffeeScript manually or make any customizations - everything works out of the box.

```coffee
import { Selector } from 'testcafe'

fixture 'CoffeeScript Example'
    .page 'https://devexpress.github.io/testcafe/example/'

nameInput = Selector '#developer-name'

test 'Test', (t) =>
    await t
        .typeText(nameInput, 'Peter')
        .typeText(nameInput, 'Paker', { replace: true })
        .typeText(nameInput, 'r', { caretPos: 2 })
        .expect(nameInput.value).eql 'Parker';
```

### ⚙ Failed Selector Method Pinpointed in the Report ([#2568](https://github.com/DevExpress/testcafe/issues/2568))

Now the test run report can identify which selector's method does not match any DOM element.

![Failed Selector Report](../images/failed-selector-report.png)

### ⚙ Fail on Uncaught Server Errors ([#2546](https://github.com/DevExpress/testcafe/issues/2546))

Previously, TestCafe ignored uncaught errors and unhandled promise rejections that occurred on the server. Whenever an error or a promise rejection happened, test execution continued.

Starting from v0.22.0, tests fail if a server error or promise rejection is unhandled. To return to the previous behavior, we have introduced the `skipUncaughtErrors` option. Use the [--skip-uncaught-errors](../documentation/reference/command-line-interface.md#-u---skip-uncaught-errors) flag in the command line or the [skipUncaughtErrors](../documentation/reference/testcafe-api/runner/run.md) option in the API.

```sh
testcafe chrome tests/fixture.js --skipUncaughtErrors
```

```js
runner.run({skipUncaughtErrors:true})
```

### ⚙ Use Glob Patterns in `runner.src` ([#980](https://github.com/DevExpress/testcafe/issues/980))

You can now use [glob patterns](https://github.com/isaacs/node-glob#glob-primer) in the [runner.src](../documentation/reference/testcafe-api/runner/src.md) method to specify a set of test files.

```js
runner.src(['/home/user/tests/**/*.js', '!/home/user/tests/foo.js']);
```

## Bug Fixes

* `RequestLogger` no longer fails when it tries to stringify a null request body ([#2718](https://github.com/DevExpress/testcafe/issues/2718))
* Temporary directories are now correctly removed when the test run is finished ([#2735](https://github.com/DevExpress/testcafe/issues/2735))
* TestCafe no longer throws `ECONNRESET` when run against a Webpack project ([#2711](https://github.com/DevExpress/testcafe/issues/2711))
* An error is no longer thrown when TestCafe tests Sencha ExtJS applications in IE11 ([#2639](https://github.com/DevExpress/testcafe/issues/2639))
* Firefox no longer waits for page elements to appear without necessity ([#2080](https://github.com/DevExpress/testcafe/issues/2080))
* `${BROWSER}` in the screenshot pattern now correctly resolves to the browser name ([#2742](https://github.com/DevExpress/testcafe/issues/2742))
* The `toString` function now returns a native string for overridden descriptor ancestors ([testcafe-hammerhead/#1713](https://github.com/DevExpress/testcafe-hammerhead/issues/1713))
* The `iframe` flag is no longer added when a form with `target="_parent"` is submitted ([testcafe-hammerhead/#1680](https://github.com/DevExpress/testcafe-hammerhead/issues/1680))
* Hammerhead no longer sends request headers in lower case ([testcafe-hammerhead/#1380](https://github.com/DevExpress/testcafe-hammerhead/issues/1380))
* The overridden `createHTMLDocument` method has the right context now ([testcafe-hammerhead/#1722](https://github.com/DevExpress/testcafe-hammerhead/issues/1722))
* Tests no longer lose connection ([testcafe-hammerhead/#1647](https://github.com/DevExpress/testcafe-hammerhead/issues/1647))
* The case when both the `X-Frame-Options` header and a CSP with `frame-ancestors` are set is now handled correctly ([testcafe-hammerhead/#1666](https://github.com/DevExpress/testcafe-hammerhead/issues/1666))
* The mechanism that resolves URLs on the client now works correctly ([testcafe-hammerhead/#1701](https://github.com/DevExpress/testcafe-hammerhead/issues/1701))
* `LiveNodeListWrapper` now imitates the native behavior correctly ([testcafe-hammerhead/#1376](https://github.com/DevExpress/testcafe-hammerhead/issues/1376))
