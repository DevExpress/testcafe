---
layout: docs
title: Fixture.afterEach Method
permalink: /documentation/reference/test-api/fixture/aftereach.html
---
# Fixture.afterEach Method

Executes the code after each test in the fixture finishes (the *after each* fixture hook).

```text
fixture.afterEach( fn(t) )
```

Parameter | Type     | Description
--------- | -------- | ---------------------------------------------------------------------------
`fn`      | Function | An asynchronous hook function that contains the hook code.
`t`       | Object   | The [test controller](../testcontroller/README.md) used to access test run API.

If a test runs in several browsers, the hook is executed in each browser.

When the hook runs, the tested webpage is already loaded, and you can use [test actions](../../../guides/basic-guides/interact-with-the-page.md) and other test run API inside the hook.

> If [test.after](../test/after.md) is specified, it overrides the corresponding
> `fixture.afterEach`, and the latter is not executed.

```js
fixture `My fixture`
    .page `http://example.com`
    .afterEach( async t => {
        await t.click('#delete-data');
    });
```

To specify code executed before each test in the fixture, use [fixture.beforeEach](beforeeach.md).
