---
layout: docs
title: Test.after Method
permalink: /documentation/reference/test-api/test/after.html
---
# Test.after Method

Executes the specified code after the test finishes (the *after* test hook).

```text
test.after( fn(t) )
```

Parameter | Type     | Description
--------- | -------- | ---------------------------------------------------------------------------
`fn`      | Function | An asynchronous hook function that contains the hook code.
`t`       | Object   | The [test controller](../testcontroller/README.md) used to access test run API.

If a test runs in several browsers, the hook is executed in each browser.

When the hook runs, the tested webpage is loaded, so that you can use [test actions](../../../guides/basic-guides/interact-with-the-page.md) and other test run API inside the hook.

> If `test.after` is specified, it overrides the corresponding
> [fixture.after](../fixture/after.md), so that the latter is not executed.

```js
fixture `My fixture`
    .page `http://example.com`;

test
    .after( async t => {
        await t.click('#delete-data');
    })
    ('MyTest', async t => { /* ... */ });
```

To specify code executed before the test, use the [test.before](before.md) method.
