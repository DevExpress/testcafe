---
layout: docs
title: t.expect.notOk Method
permalink: /documentation/reference/test-api/testcontroller/expect/notok.html
---
# t.expect.notOk Method

Asserts that `actual` is false.

```text
await t.expect( actual ).notOk( message, options );
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------
`actual`             | Any type | A value tested in the assertion. The assertion passes if the `actual` value is falsy. See [`actual` parameter value](#actual-parameter-value).
`message`&#160;*(optional)* | String   | An assertion message displayed in the report if the test fails.
`options`&#160;*(optional)* | Object   | See [Options](#options).

**Examples:**

```js
await t
    .expect('ok').notOk('this assertion will fail')
    .expect(false).notOk('this assertion will pass');
```

```js
import { Selector } from 'testcafe';

fixture `My fixture`;

test('My test', async t => {
    await t.expect(Selector('#element').exists).notOk();
});
```

## `actual` Parameter Value

{% include assertions/actual-parameter-value.md %}

## Options

### options.timeout

{% include assertions/timeout.md %}

### options.allowUnawaitedPromise

{% include assertions/allowunawaitedpromise.md %}
