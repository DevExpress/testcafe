---
layout: docs
title: Runner.src Method
permalink: /documentation/reference/testcafe-api/runner/src.html
---
# Runner.src Method

Configures the test runner to run tests from the specified files.

```text
src(source) → this
```

Parameter | Type                | Description
--------- | ------------------- | ----------------------------------------------------------------------------
`source`  | String &#124; Array | The relative or absolute path to a test fixture file, or several such paths. You can use [glob patterns](https://github.com/isaacs/node-glob#glob-primer) to include (or exclude) multiple files.

TestCafe can run:

* JavaScript, TypeScript and CoffeeScript files that use TestCafe API,
* [TestCafe Studio](https://www.devexpress.com/products/testcafestudio/) tests (`.testcafe` files),
* Legacy TestCafe v2015.1 tests.

You do not need to call this function if you specify the [src](../../configuration-file.md#src) property in the [configuration file](../../configuration-file.md).

*Related configuration file property*: [src](../../configuration-file.md#src)

**Examples**

```js
runner.src(['/home/user/js-tests/fixture.js', 'studio-fixture.testcafe']);
```

```js
runner.src(['/home/user/tests/**/*.js', '!/home/user/tests/foo.js']);
```
