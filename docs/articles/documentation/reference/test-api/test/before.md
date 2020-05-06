---
layout: docs
title: Test.before Method
permalink: /documentation/reference/test-api/test/before.html
---
# Test.before Method

Executes the specified code before the test starts (the *before* test hook).

```text
test.before( fn(t) )
```

Parameter | Type     | Description
--------- | -------- | ---------------------------------------------------------------------------
`fn`      | Function | An asynchronous hook function that contains the hook code.
`t`       | Object   | The [test controller](../testcontroller/README.md) used to access test run API.

If a test runs in several browsers, the hook is executed in each browser.

When the hook runs, the tested webpage is loaded, so that you can use [test actions](../../../guides/basic-guides/interact-with-the-page.md) and other test run API inside the hook.

> If `test.before` is specified, it overrides the corresponding
> [fixture.before](../fixture/before.md), so that the latter is not executed.

```js
fixture `My fixture`
    .page `http://example.com`;

test
    .before( async t => {
        await t
            .useRole(admin)
            .click('#open-management-console');
    })
    ('MyTest', async t => { /* ... */ });
```

To specify code executed after the test, use the [test.after](after.md) method.
