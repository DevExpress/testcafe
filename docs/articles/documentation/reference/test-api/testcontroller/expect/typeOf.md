---
layout: docs
title: t.expect.typeOf Method
permalink: /documentation/reference/test-api/testcontroller/expect/typeof.html
---
# t.expect.typeOf Method

Asserts that the `actual` type is `typeName`.

```text
await t.expect( actual ).typeOf( typeName, message, options );
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------
`actual`             | Any type | A comparison value. See [`actual` parameter value](#actual-parameter-value).
`typeName`             | String | The expected type of an `actual` value.
`message`&#160;*(optional)* | String   | An assertion message displayed in the report if the test fails.
`options`&#160;*(optional)* | Object   | See [Options](#options).

**Examples:**

```js
await t
    .expect({ a: 'bar' }).typeOf('object', 'it\'s an object')
    .expect(/bar/).typeOf('regexp', 'it\'s a regular expression')
    .expect(null).typeOf('null', 'it\'s a null');
```

```js
import { Selector } from 'testcafe';

fixture `My fixture`;

test('My test', async t => {
    await t.expect(Selector('#element').getAttribute('attr')).typeOf('string');
});
```

## `actual` Parameter Value

{% include assertions/actual-parameter-value.md %}

## Options

### options.timeout

{% include assertions/timeout.md %}

### options.allowUnawaitedPromise

{% include assertions/allowunawaitedpromise.md %}
