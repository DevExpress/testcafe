---
layout: docs
title: t.expect.gt Method
permalink: /documentation/reference/test-api/testcontroller/expect/gt.html
---
# t.expect.gt Method

Asserts that `actual` is greater than `expected`.

```text
await t.expect( actual ).gt( expected, message, options );
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------
`actual`             | Number | A value tested in the assertion. The assertion passes if the `actual` value is greater than the `expected`. See [`actual` parameter value](#actual-parameter-value).
`expected`             | Any type | A comparison value.
`message`&#160;*(optional)* | String   | An assertion message displayed in the report if the test fails.
`options`&#160;*(optional)* | Object   | See [Options](#options).

**Example:**

```js
await t.expect(5).gt(2, '5 is greater than 2');
```

```js
import { Selector } from 'testcafe';

fixture `My fixture`;

test('My test', async t => {
    await t.expect(Selector('#element').clientWidth).gt(300);
});
```

## `actual` Parameter Value

{% include assertions/actual-parameter-value.md %}

## Options

### options.timeout

{% include assertions/timeout.md %}

### options.allowUnawaitedPromise

{% include assertions/allowunawaitedpromise.md %}
