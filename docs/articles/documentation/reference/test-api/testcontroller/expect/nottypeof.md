---
layout: docs
title: t.expect.notTypeOf Method
permalink: /documentation/reference/test-api/testcontroller/expect/nottypeof.html
---
# t.expect.notTypeOf Method

Asserts that the `actual` type is not `typeName`.

```text
await t.expect( actual ).notTypeOf( typeName, message, options );
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------
`actual`             | Any type | A comparison value. See [`actual` parameter value](#actual-parameter-value).
`typeName`             | String | The type of the `actual` value that causes an assertion to fail.
`message`&#160;*(optional)* | String   | An assertion message displayed in the report if the test fails.
`options`&#160;*(optional)* | Object   | See [Options](#options).

**Example:**

```js
await t.expect('bar').notTypeOf('number', 'string is not a number');
```

```js
import { Selector } from 'testcafe';

fixture `My fixture`;

test('My test', async t => {
    await t.expect(Selector('#element').getAttribute('attr')).notTypeOf('null');
});
```

## `actual` Parameter Value

{% include assertions/actual-parameter-value.md %}

## Options

### options.timeout

{% include assertions/timeout.md %}

### options.allowUnawaitedPromise

{% include assertions/allowunawaitedpromise.md %}
