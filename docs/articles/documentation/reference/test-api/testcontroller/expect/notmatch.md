---
layout: docs
title: t.expect.notMatch Method
permalink: /documentation/reference/test-api/testcontroller/expect/notmatch.html
---
# t.expect.notMatch Method

Asserts that `actual` does not match the `re` regular expression.

```text
await t.expect( actual ).notMatch( re, message, options );
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------
`actual`             | String | A comparison value. See [`actual` parameter value](#actual-parameter-value).
`re`             | RegExp | A regular expression that is expected not to match `actual`.
`message`&#160;*(optional)* | String   | An assertion message displayed in the report if the test fails.
`options`&#160;*(optional)* | Object   | See [Options](#options).

**Example:**

```js
await t.expect('foobar').notMatch(/^b/, 'this assertion will be passed');
```

```js
import { ClientFunction } from 'testcafe';

fixture `My fixture`;

test('My test', async t => {
    const getLocation = ClientFunction(() => document.location.href.toString());

    await t.expect(getLocation()).notMatch(/\.co\.uk/);
});
```

## `actual` Parameter Value

{% include assertions/actual-parameter-value.md %}

## Options

### options.timeout

{% include assertions/timeout.md %}

### options.allowUnawaitedPromise

{% include assertions/allowunawaitedpromise.md %}
