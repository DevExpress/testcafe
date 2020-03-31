---
layout: docs
title: t.expect.match Method
permalink: /documentation/reference/test-api/testcontroller/expect/match.html
---
# t.expect.match Method

Asserts that `actual` matches the `re` regular expression.

```text
await t.expect( actual ).match( re, message, options );
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------
`actual`             | String | A comparison value. See [`actual` parameter value](#actual-parameter-value).
`re`             | RegExp | A regular expression that is expected to match `actual`.
`message`&#160;*(optional)* | String   | An assertion message displayed in the report if the test fails.
`options`&#160;*(optional)* | Object   | See [Options](#options).

**Example:**

```js
await t.expect('foobar').match(/^f/, 'this assertion will be passed');
```

```js
import { ClientFunction } from 'testcafe';

fixture `My fixture`;

test('My test', async t => {
    const getLocation = ClientFunction(() => document.location.href.toString());

    await t.expect(getLocation()).match(/\.com/);
});
```

## `actual` Parameter Value

{% include assertions/actual-parameter-value.md %}

## Options

### options.timeout

{% include assertions/timeout.md %}

### options.allowUnawaitedPromise

{% include assertions/allowunawaitedpromise.md %}
