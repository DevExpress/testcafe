---
layout: docs
title: t.expect.notContains Method
permalink: /documentation/reference/test-api/testcontroller/expect/notContains.html
---
# t.expect.notContains Method

Asserts that `actual` does not contain `expected`.

```text
await t.expect( actual ).notContains( expected, message, options );
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------
`actual`             | String &#124; Array &#124; Object | A value we expect not to contain the `expected`. See [`actual` parameter value](#actual-parameter-value).
`expected`             | Any type | The expected value.
`message`&#160;*(optional)* | String   | An assertion message that is displayed in the report if the test fails.
`options`&#160;*(optional)* | Object   | See [Options](#options).

**Examples:**

```js
await t
    .expect('foo bar').notContains('baz', 'string does not contain a substring')
    .expect([1, 2, 3]).notContains(4, 'array does not contain a value')
    .expect({ foo: 'bar', hello: 'universe' }).notContains({ buzz: 'abc' }, 'object does not contain a property');
```

```js
import { ClientFunction } from 'testcafe';

fixture `My fixture`;

test('My test', async t => {
    const getLocation = ClientFunction(() => document.location.href.toString());

    await t.expect(getLocation()).notContains('devexpress.com');
});
```

## `actual` Parameter Value

{% include assertions/actual-parameter-value.md %}

## Options

* options.timeout

{% include assertions/timeout.md %}

* options.allowUnawaitedPromise

{% include assertions/allowUnawaitedPromise.md %}
