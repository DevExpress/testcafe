---
layout: docs
title: t.expect.notEql Method
permalink: /documentation/reference/test-api/testcontroller/expect/notEql.html
---
# t.expect.notEql Method

Assert that `actual` is not equal to `unexpected`.

```text
await t.expect( actual ).notEql( unexpected, message, options );
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------
`actual`             | Any type | A comparison value. See [`actual` parameter value](#actual-parameter-value).
`expected`             | Any type | An unexpected value.
`message`&#160;*(optional)* | String   | An assertion message that is displayed in the report if the test fails.
`options`&#160;*(optional)* | Object   | See [Options](#options).

**Examples:**

```js
await t
    .expect({ a: 'bar' }).notEql({ a: 'bar' }, 'this assertion will fail')
    .expect({ a: 'bar' }).notEql({ a: 'foo' }, 'this assertion will pass');
```

```js
import { Selector } from 'testcafe';

fixture `My fixture`;

test('My test', async t => {
    await t.expect(Selector('.className').count).notEql(2);
});
```

## `actual` Parameter Value

{% include assertions/actual-parameter-value.md %}

## Options

* options.timeout

{% include assertions/timeout.md %}

* options.allowUnawaitedPromise

{% include assertions/allowUnawaitedPromise.md %}
