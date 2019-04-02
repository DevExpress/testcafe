---
layout: post
title: TestCafe v0.23.1 Released
permalink: /blog/:title.html
---
# TestCafe v0.23.1 Released

Use metadata to select and run tests and fixtures, and load tests dynamically.

<!--more-->

## Enhancements

### ⚙ Select Tests and Fixtures to Run by Their Metadata ([#2527](https://github.com/DevExpress/testcafe/issues/2527)) by [@NickCis](https://github.com/NickCis)

You can now run only those tests or fixtures whose [metadata](https://devexpress.github.io/testcafe/documentation/test-api/test-code-structure.html#specifying-testing-metadata) contains a specific set of values. Use the [--test-meta](https://devexpress.github.io/testcafe/documentation/using-testcafe/command-line-interface.html#--test-meta-keyvaluekey2value2) and [--fixture-meta](https://devexpress.github.io/testcafe/documentation/using-testcafe/command-line-interface.html#--fixture-meta-keyvaluekey2value2) flags to specify these values.

```sh
testcafe chrome my-tests --test-meta device=mobile,env=production
```

```sh
testcafe chrome my-tests --fixture-meta subsystem=payments,type=regression
```

In the API, test and fixture metadata is now passed to the [runner.filter](https://devexpress.github.io/testcafe/documentation/using-testcafe/programming-interface/runner.html#filter) method in the `testMeta` and `fixtureMeta` parameters. Use this metadata to build a logic that determines whether to run the current test.

```js
runner.filter((testName, fixtureName, fixturePath, testMeta, fixtureMeta) => {
    return testMeta.mobile === 'true' &&
        fixtureMeta.env === 'staging';
});
```

### ⚙ Run Dynamically Loaded Tests ([#2074](https://github.com/DevExpress/testcafe/issues/2074))

You can now run tests imported from external libraries or generated dynamically even if the `.js` file does not contain any tests.

Previously, test files had to contain the [fixture](https://devexpress.github.io/testcafe/documentation/test-api/test-code-structure.html#fixtures) and [test](https://devexpress.github.io/testcafe/documentation/test-api/test-code-structure.html#tests) directives. You can now add the `--disable-test-syntax-validation` command line flag to bypass this check.

```sh
testcafe safari test.js --disable-test-syntax-validation
```

In the API, use the `disableTestSyntaxValidation` option.

```js
runner.run({ disableTestSyntaxValidation: true })
```

## Bug Fixes

* Touch events are now simulated with correct touch properties (`touches`, `targetTouches`, `changedTouches`) ([#2856](https://github.com/DevExpress/testcafe/issues/2856))
* Google Chrome now closes correctly on macOS after tests are finished ([#2860](https://github.com/DevExpress/testcafe/issues/2860))
* Internal attribute and node changes no longer trigger `MutationObserver` notifications ([testcafe-hammerhead/#1769](https://github.com/DevExpress/testcafe-hammerhead/issues/1769))
* The `ECONNABORTED` error is no longer raised ([testcafe-hammerhead/#1744](https://github.com/DevExpress/testcafe-hammerhead/issues/1744))
* Websites that use `Location.ancestorOrigins` are now proxied correctly ([testcafe-hammerhead/#1342](https://github.com/DevExpress/testcafe-hammerhead/issues/1342))
