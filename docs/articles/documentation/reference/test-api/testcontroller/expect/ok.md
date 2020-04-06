---
layout: docs
title: t.expect.ok Method
permalink: /documentation/reference/test-api/testcontroller/expect/ok.html
---
# t.expect.ok Method

Asserts that `actual` is true.

```text
await t.expect( actual ).ok( message, options );
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------
`actual`             | Any type | A value tested in the assertion. The assertion passes if the `actual` value is truthy. See [`actual` parameter value](#actual-parameter-value).
`message`&#160;*(optional)* | String   | An assertion message displayed in the report if the test fails.
`options`&#160;*(optional)* | Object   | See [Options](#options).

**Examples:**

```js
await t
    .expect('ok').ok('this assertion will pass')
    .expect(false).ok('this assertion will fail');
```

```js
import { Selector } from 'testcafe';

fixture `My fixture`;

test('My test', async t => {
    await t.expect(Selector('#element').exists).ok();
});
```

## `actual` Parameter Value

{% include assertions/actual-parameter-value.md %}

## Options

### options.timeout

{% include assertions/timeout.md %}

### options.allowUnawaitedPromise

{% include assertions/allowunawaitedpromise.md %}
