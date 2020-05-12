---
layout: docs
title: test Function
permalink: /documentation/reference/test-api/global/test.html
---
# test Function

Declares a test.

```text
test( testName, fn(t) )
```

Parameter  | Type     | Description
---------- | -------- | --------------------------------------------------------------------
`testName` | String   | The test name.
`fn`       | Function | An asynchronous function that contains the test code.
`t`        | Object   | The [test controller](../testcontroller/README.md) used to access the test run API.

```js
fixture `My Fixture`;

test('Click a button', async t => {
    await t.click('#button');
});

test('Type something', async t => {
    await t.typeText('#comment', 'I love TestCafe')
});
```

Use the [fixture](fixture.md) global function to declare fixtures.
