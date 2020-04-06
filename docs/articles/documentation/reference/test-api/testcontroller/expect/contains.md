---
layout: docs
title: t.expect.contains Method
permalink: /documentation/reference/test-api/testcontroller/expect/contains.html
---
# t.expect.contains Method

Asserts that `actual` contains `expected`.

```text
await t.expect( actual ).contains( expected, message, options );
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------
`actual`             | String &#124; Array &#124; Object | A value tested in the assertion. The assertion passes if the `actual` value contains the `expected`. See [`actual` parameter value](#actual-parameter-value).
`expected`             | Any type | The expected value.
`message`&#160;*(optional)* | String   | An assertion message displayed in the report if the test fails.
`options`&#160;*(optional)* | Object   | See [Options](#options).

**Examples:**

```js
await t
    .expect('foo bar').contains('bar', 'string contains the expected substring')
    .expect([1, 2, 3]).contains(2, 'array contains the expected value')
    .expect({ foo: 'bar', hello: 'universe' }).contains({ foo: 'bar' }, 'object contains the expected property');
```

```js
import { ClientFunction } from 'testcafe';

fixture `My fixture`;

test('My test', async t => {
    const getLocation = ClientFunction(() => document.location.href.toString());

    await t.expect(getLocation()).contains('example.com');
});
```

## `actual` Parameter Value

{% include assertions/actual-parameter-value.md %}

## Options

### options.timeout

{% include assertions/timeout.md %}

### options.allowUnawaitedPromise

{% include assertions/allowunawaitedpromise.md %}
