---
layout: docs
title: Fixture.beforeEach Method
permalink: /documentation/reference/test-api/fixture/beforeeach.html
---
# Fixture.beforeEach Method

Executes the code before each test in the fixture starts (the *before each* fixture hook).

```text
fixture.beforeEach( fn(t) )
```

Parameter | Type     | Description
--------- | -------- | ---------------------------------------------------------------------------
`fn`      | Function | An asynchronous hook function that contains the hook code.
`t`       | Object   | The [test controller](../testcontroller/README.md) used to access test run API.

If a test runs in several browsers, the hook is executed in each browser.

When the hook runs, the tested webpage is already loaded, and you can use [test actions](../../../guides/basic-guides/interact-with-the-page.md) and other test run API inside the hook.

> If [test.before](../test/before.md) is specified, it overrides the corresponding
> `fixture.beforeEach`, and the latter is not executed.

```js
fixture `My fixture`
    .page `http://example.com`
    .beforeEach( async t => {
        await t
            .useRole(admin)
            .click('#open-management-console');
    });
```

To specify code executed after each test in the fixture, use [fixture.afterEach](aftereach.md).
