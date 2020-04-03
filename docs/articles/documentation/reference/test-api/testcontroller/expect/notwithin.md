---
layout: docs
title: t.expect.notWithin Method
permalink: /documentation/reference/test-api/testcontroller/expect/notwithin.html
---
# t.expect.notWithin Method

Asserts that `actual` is not within a range from `start` to `finish`. Bounds are inclusive.

```text
await t.expect( actual ).notWithin( start, finish, message, options );
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------
`actual`             | Number | A comparison value. See [`actual` parameter value](#actual-parameter-value).
`start`             | Number | The lower range (included).
`finish`             | Number | The upper range (included).
`message`&#160;*(optional)* | String   | An assertion message displayed in the report if the test fails.
`options`&#160;*(optional)* | Object   | See [Options](#options).

**Example:**

```js
await t.expect(1).notWithin(3, 10, 'this assertion will pass');
```

```js
import { Selector } from 'testcafe';

fixture `My fixture`;

test('My test', async t => {
    await t.expect(Selector('#element').scrollTop).notWithin(100, 200);
});
```

## `actual` Parameter Value

{% include assertions/actual-parameter-value.md %}

## Options

### options.timeout

{% include assertions/timeout.md %}

### options.allowUnawaitedPromise

{% include assertions/allowunawaitedpromise.md %}
