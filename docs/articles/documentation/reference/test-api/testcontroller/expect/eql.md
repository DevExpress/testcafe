---
layout: docs
title: t.expect.eql Method
permalink: /documentation/reference/test-api/testcontroller/expect/eql.html
---
# t.expect.eql Method

Asserts that `actual` is equal to `expected`.

```text
await t.expect( actual ).eql( expected, message, options );
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------
`actual`             | Any type | A comparison value. See [`actual` parameter value](#actual-parameter-value).
`expected`             | Any type | An expected value.
`message`&#160;*(optional)* | String   | An assertion message displayed in the report if the test fails.
`options`&#160;*(optional)* | Object   | See [Options](#options).

**Examples:**

```js
await t
    .expect({ a: 'bar' }).eql({ a: 'bar' }, 'this assertion will pass')
    .expect({ a: 'bar' }).eql({ a: 'foo' }, 'this assertion will fail');
```

```js
import { Selector } from 'testcafe';

fixture `My fixture`;

test('My test', async t => {
    await t.expect(Selector('.className').count).eql(3);
});
```

## `actual` Parameter Value

{% include assertions/actual-parameter-value.md %}

## Options

### options.timeout

{% include assertions/timeout.md %}

### options.allowUnawaitedPromise

{% include assertions/allowunawaitedpromise.md %}
