---
layout: docs
title: t.expect.gte Method
permalink: /documentation/reference/test-api/testcontroller/expect/gte.html
---
# t.expect.gte Method

Asserts that `actual` is greater than or equal to `expected`.

```text
await t.expect( actual ).gte( expected, message, options );
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------
`actual`             | Number | A value that we expect to be greater than or equal to `expected`. See [`actual` parameter value](#actual-parameter-value).
`expected`             | Any type | A comparison value.
`message`&#160;*(optional)* | String   | An assertion message that is displayed in the report if the test fails.
`options`&#160;*(optional)* | Object   | See [Options](#options).

**Examples:**

```js
await t
    .expect(5).gte(2, '5 is greater or equal than 2')
    .expect(2).gte(2, '2 is greater or equal than 2 ');
```

```js
import { Selector } from 'testcafe';

fixture `My fixture`;

test('My test', async t => {
    await t.expect(Selector('#element').clientWidth).gte(50);
});
```

## `actual` Parameter Value

{% include assertions/actual-parameter-value.md %}

## Options

* options.timeout

{% include assertions/timeout.md %}

* options.allowUnawaitedPromise

{% include assertions/allowUnawaitedPromise.md %}
