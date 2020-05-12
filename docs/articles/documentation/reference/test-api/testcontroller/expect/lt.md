---
layout: docs
title: t.expect.lt Method
permalink: /documentation/reference/test-api/testcontroller/expect/lt.html
---
# t.expect.lt Method

Asserts that `actual` is less than `expected`.

```text
await t.expect( actual ).lt( expected, message, options );
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------
`actual`             | Number | A value tested in the assertion. The assertion passes if the `actual` value is less than the `expected`. See [`actual` parameter value](#actual-parameter-value).
`expected`             | Any type | A comparison value.
`message`&#160;*(optional)* | String   | An assertion message displayed in the report if the test fails.
`options`&#160;*(optional)* | Object   | See [Options](#options).

**Example:**

```js
await t.expect(2).lt(5, '2 is less than 5');
```

```js
import { Selector } from 'testcafe';

fixture `My fixture`;

test('My test', async t => {
    await t.expect(Selector('#element').offsetHeight).lt(25);
});
```

## `actual` Parameter Value

{% include assertions/actual-parameter-value.md %}

## Options

### options.timeout

{% include assertions/timeout.md %}

### options.allowUnawaitedPromise

{% include assertions/allowunawaitedpromise.md %}
