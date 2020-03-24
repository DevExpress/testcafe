---
layout: docs
title: t.expect.lte Method
permalink: /documentation/reference/test-api/testcontroller/expect/lte.html
---
# t.expect.lte Method

Asserts that `actual` is less than or equal to `expected`.

```text
await t.expect( actual ).lte( expected, message, options );
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------
`actual`             | Number |  A value that we expect to be less than or equal to `expected`. See [`actual` parameter value](#actual-parameter-value).
`expected`             | Any type | A comparison value.
`message`&#160;*(optional)* | String   | An assertion message that is displayed in the report if the test fails.
`options`&#160;*(optional)* | Object   | See [Options](#options).

**Examples:**

```js
await t
    .expect(2).lte(5, '2 is less or equal than 5')
    .expect(2).lte(2, '2 is less or equal than 2 ');
```

```js
import { Selector } from 'testcafe';

fixture `My fixture`;

test('My test', async t => {
    await t.expect(Selector('#element').offsetHeight).lte(400);
});
```

## `actual` Parameter Value

{% include assertions/actual-parameter-value.md %}

## Options

* options.timeout

{% include assertions/timeout.md %}

* options.allowUnawaitedPromise

{% include assertions/allowUnawaitedPromise.md %}
