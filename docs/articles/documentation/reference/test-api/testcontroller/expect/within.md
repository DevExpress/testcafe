---
layout: docs
title: t.expect.within Method
permalink: /documentation/reference/test-api/testcontroller/expect/within.html
---
# t.expect.within Method

Asserts that `actual` is within a range from `start` to `finish`. Bounds are inclusive.

```text
await t.expect( actual ).within( start, finish, message, options );
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
await t.expect(5).within(3, 10, 'this assertion will pass');
```

```js
import { Selector } from 'testcafe';

fixture `My fixture`;

test('My test', async t => {
    await t.expect(Selector('#element').scrollTop).within(300, 400);
});
```

## `actual` Parameter Value

{% include assertions/actual-parameter-value.md %}

## Options

### options.timeout

{% include assertions/timeout.md %}

### options.allowUnawaitedPromise

{% include assertions/allowunawaitedpromise.md %}
