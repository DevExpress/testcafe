---
layout: docs
title: Assertion methods
permalink: /documentation/test-api/assertions/assertion-api.html
checked: false
---
# Assertion API

The following assertion methods are available.

* [Deep Equal](#deep-equal)
* [Not Deep Equal](#not-deep-equal)
* [Ok](#ok)
* [Not Ok](#not-ok)
* [Contains](#contains)
* [Not Contains](#not-contains)
* [Type of](#type-of)
* [Not Type of](#not-type-of)
* [Great than](#great-than)
* [Great than or Equal to](#great-than-or-equal-to)
* [Less than](#less-than)
* [Less than or Equal to](#less-than-or-equal-to)
* [Within](#within)
* [Not Within](#not-within)
* [Match](#match)
* [Not Match](#not-match)

## Deep Equal

Asserts that `actual` is deeply equal to `expected`.

```text
await t.expect( actual ).eql( expected, message, options );
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------
`actual`             | Value &#124; Object &#124; Selector's Property &#124; ClientFunction | A comparison value. If you pass a [selector's property](../selecting-page-elements/selectors.md#define-assertion-actual-value) or a [client function](../obtaining-data-from-the-client.md) promise, the [Smart Assertion Query Mechanism](README.md#smart-assertion-query-mechanism) is activated and the assertion automatically waits until the comparison value is obtained.
`expected`             | Any type | An expected value.
`message`&#160;*(optional)* | String   | An assertion message that will be displayed in the report if the test fails.
`options`&#160;*(optional)* | Object   | See [Options](README.md#assertion-options).

**Examples:**

```js
await t
    .expect({ a: 'bar' }).eql({ a: 'bar' }, 'this assertion will pass')
    .expect({ a: 'bar' }).eql({ a: 'foo' }, 'this assertion will fail');
```

```js
import { ClientFunction } from 'testcafe';

fixture `My fixture`;

test('My test', async t => {
    const fn = ClientFunction(param => {a: param});

    await t.expect(fn('bar')).eql({ a: 'bar' });
});
```

## Not Deep Equal

Assert that `actual` is not deeply equal to `unexpected`.

```text
await t.expect( actual ).notEql( unexpected, message, options );
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------
`actual`             | Value &#124; Object &#124; Selector's Property &#124; ClientFunction | A comparison value. If you pass a [selector's property](../selecting-page-elements/selectors.md#define-assertion-actual-value) or a [client function](../obtaining-data-from-the-client.md) promise, the [Smart Assertion Query Mechanism](README.md#smart-assertion-query-mechanism) is activated and the assertion automatically waits until the comparison value is obtained.
`expected`             | Any type | An unexpected value.
`message`&#160;*(optional)* | String   | An assertion message that will be displayed in the report if the test fails.
`options`&#160;*(optional)* | Object   | See [Options](README.md#assertion-options).

**Examples:**

```js
await t
    .expect({ a: 'bar' }).notEql({ a: 'bar' }, 'this assertion will fail')
    .expect({ a: 'bar' }).notEql({ a: 'foo' }, 'this assertion will pass');
```

```js
import { ClientFunction } from 'testcafe';

fixture `My fixture`;

test('My test', async t => {
    const fn = ClientFunction(param => {a: param});

    await t.expect(fn('foo')).notEql({ a: 'bar' });
});
```

## Ok

Asserts that `actual` is truthy.

```text
await t.expect( actual ).ok( message, options );
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------
`actual`             | Value &#124; Object &#124; Selector's Property &#124; ClientFunction | A value that should be truthy. If you pass a [selector's property](../selecting-page-elements/selectors.md#define-assertion-actual-value) or a [client function](../obtaining-data-from-the-client.md) promise, the [Smart Assertion Query Mechanism](README.md#smart-assertion-query-mechanism) is activated and the assertion automatically waits until the `actual` value is obtained.
`message`&#160;*(optional)* | String   | An assertion message that will be displayed in the report if the test fails.
`options`&#160;*(optional)* | Object   | See [Options](README.md#assertion-options).

**Examples:**

```js
await t
    .expect('ok').ok('this assertion will pass')
    .expect(false).ok('this assertion will fail');
```

```js
import { ClientFunction } from 'testcafe';

fixture `My fixture`;

test('My test', async t => {
    const fn = ClientFunction(() => 'ok');

    await t.expect(fn()).ok();
});
```

## Not Ok

Asserts that `actual` is falsy.

```text
await t.expect( actual ).notOk( message, options );
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------
`actual`             | Value &#124; Object &#124; Selector's Property &#124; ClientFunction | A value that should be falsy. If you pass a [selector's property](../selecting-page-elements/selectors.md#define-assertion-actual-value) or a [client function](../obtaining-data-from-the-client.md) promise, the [Smart Assertion Query Mechanism](README.md#smart-assertion-query-mechanism) is activated and the assertion automatically waits until the `actual` value is obtained.
`message`&#160;*(optional)* | String   | An assertion message that will be displayed in the report if the test fails.
`options`&#160;*(optional)* | Object   | See [Options](README.md#assertion-options).

**Examples:**

```js
await t
    .expect('ok').notOk('this assertion will fail')
    .expect(false).notOk('this assertion will pass');
```

```js
import { ClientFunction } from 'testcafe';

fixture `My fixture`;

test('My test', async t => {
    const fn = ClientFunction(() => false);

    await t.expect(fn()).notOk();
});
```

## Contains

Asserts that `actual` contains `expected`.

```text
await t.expect( actual ).contains( expected, message, options );
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------
`actual`             | String &#124; Array &#124; Object &#124; Selector's Property &#124; ClientFunction | A string that contains the `expected` substring, an array that contains the `expected` value or an object that contains the `expected` property. If you pass a [selector's property](../selecting-page-elements/selectors.md#define-assertion-actual-value) or a [client function](../obtaining-data-from-the-client.md) promise, the [Smart Assertion Query Mechanism](README.md#smart-assertion-query-mechanism) is activated and the assertion automatically waits until the `actual` value is obtained.
`expected`             | Any type | The expected value.
`message`&#160;*(optional)* | String   | An assertion message that will be displayed in the report if the test fails.
`options`&#160;*(optional)* | Object   | See [Options](README.md#assertion-options).

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
    const fn = ClientFunction(param => [param + 1, param + 2, param + 3]);

    await t.expect(fn(0)).contains(3);
});
```

## Not Contains

Asserts that `actual` does not contain `expected`.

```text
await t.expect( actual ).notContains( expected, message, options );
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------
`actual`             | String &#124; Array &#124; Object &#124; Selector's Property &#124; ClientFunction | A string that should not contain the `expected` substring, an array that should not contain the `expected` value or an object that should not contain the `expected` property. If you pass a [selector's property](../selecting-page-elements/selectors.md#define-assertion-actual-value) or a [client function](../obtaining-data-from-the-client.md) promise, the [Smart Assertion Query Mechanism](README.md#smart-assertion-query-mechanism) is activated and the assertion automatically waits until the `actual` value is obtained.
`expected`             | Any type | The expected value.
`message`&#160;*(optional)* | String   | An assertion message that will be displayed in the report if the test fails.
`options`&#160;*(optional)* | Object   | See [Options](README.md#assertion-options).

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
    const fn = ClientFunction(param => [param + 1, param + 2, param + 3]);

    await t.expect(fn(0)).notContains(4);
});
```

## Type Of

Asserts that type of `actual` is `typeName`.

```text
await t.expect( actual ).typeOf( typeName, message, options );
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------
`actual`             | Value &#124; Object &#124; Selector's Property &#124; ClientFunction  | A comparison value. If you pass a [selector's property](../selecting-page-elements/selectors.md#define-assertion-actual-value) or a [client function](../obtaining-data-from-the-client.md) promise, the [Smart Assertion Query Mechanism](README.md#smart-assertion-query-mechanism) is activated and the assertion automatically waits until the `actual` value is obtained.
`typeName`             | String | The expected type of an `actual` value.
`message`&#160;*(optional)* | String   | An assertion message that will be displayed in the report if the test fails.
`options`&#160;*(optional)* | Object   | See [Options](README.md#assertion-options).

**Examples:**

```js
await t
    .expect({ a: 'bar' }).typeOf('object', 'it\'s an object')
    .expect(/bar/).typeOf('regexp', 'it\'s a regular expression')
    .expect(null).typeOf('null', 'it\'s a null');
```

```js
import { ClientFunction } from 'testcafe';

fixture `My fixture`;

test('My test', async t => {
    const fn = ClientFunction(param => {a: param});

    await t.expect(fn('foo')).typeOf('object');
});
```

## Not Type of

Asserts that type of `actual` is not `typeName`.

```text
await t.expect( actual ).notTypeOf( typeName, message, options );
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------
`actual`             | Value &#124; Object &#124; Selector's Property &#124; ClientFunction | A comparison value. If you pass a [selector's property](../selecting-page-elements/selectors.md#define-assertion-actual-value) or a [client function](../obtaining-data-from-the-client.md) promise, the [Smart Assertion Query Mechanism](README.md#smart-assertion-query-mechanism) is activated and the assertion automatically waits until the `actual` value is obtained.
`typeName`             | String | An unexpected type of `actual` value.
`message`&#160;*(optional)* | String   | An assertion message that will be displayed in the report if the test fails.
`options`&#160;*(optional)* | Object   | See [Options](README.md#assertion-options).

**Example:**

```js
await t.expect('bar').notTypeOf('number', 'string is not a number');
```

```js
import { ClientFunction } from 'testcafe';

fixture `My fixture`;

test('My test', async t => {
    const fn = ClientFunction(param => {a: param});

    await t.expect(fn('foo')).notTypeOf('number');
});
```

## Great than

Asserts that `actual` is strictly greater than `expected`.

```text
await t.expect( actual ).gt( expected, message, options );
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------
`actual`             | Number &#124; Selector's Property &#124; ClientFunction  | A value that should be greater than `expected`. If you pass a [selector's property](../selecting-page-elements/selectors.md#define-assertion-actual-value) or a [client function](../obtaining-data-from-the-client.md) promise, the [Smart Assertion Query Mechanism](README.md#smart-assertion-query-mechanism) is activated and the assertion automatically waits until the `actual` value is obtained.
`expected`             | Any type | A comparison value.
`message`&#160;*(optional)* | String   | An assertion message that will be displayed in the report if the test fails.
`options`&#160;*(optional)* | Object   | See [Options](README.md#assertion-options).

**Example:**

```js
await t.expect(5).gt(2, '5 is strictly greater than 2');
```

```js
import { ClientFunction } from 'testcafe';

fixture `My fixture`;

test('My test', async t => {
    const fn = ClientFunction(param => param * 2);

    await t.expect(fn(3)).gt(5);
});
```

## Great than or Equal to

Asserts that `actual` is greater than or equal to `expected`.

```text
await t.expect( actual ).gte( expected, message, options );
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------
`actual`             | Number &#124; Selector's Property &#124; ClientFunction | A value that should be greater than or equal to `expected`. If you pass a [selector's property](../selecting-page-elements/selectors.md#define-assertion-actual-value) or a [client function](../obtaining-data-from-the-client.md) promise, the [Smart Assertion Query Mechanism](README.md#smart-assertion-query-mechanism) is activated and the assertion automatically waits until the `actual` value is obtained.
`expected`             | Any type | A comparison value.
`message`&#160;*(optional)* | String   | An assertion message that will be displayed in the report if the test fails.
`options`&#160;*(optional)* | Object   | See [Options](README.md#assertion-options).

**Examples:**

```js
await t
    .expect(5).gte(2, '5 is greater or equal than 2')
    .expect(2).gte(2, '2 is greater or equal than 2 ');
```

```js
import { ClientFunction } from 'testcafe';

fixture `My fixture`;

test('My test', async t => {
    const fn = ClientFunction(param => param * 2);

    await t.expect(fn(3)).gte(6);
});
```

## Less than

Asserts that `actual` is strictly less than `expected`.

```text
await t.expect( actual ).lt( expected, message, options );
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------
`actual`             | Number &#124; Selector's Property &#124; ClientFunction | A value that should be less than `expected`. If you pass a [selector's property](../selecting-page-elements/selectors.md#define-assertion-actual-value) or a [client function](../obtaining-data-from-the-client.md) promise, the [Smart Assertion Query Mechanism](README.md#smart-assertion-query-mechanism) is activated and the assertion automatically waits until the `actual` value is obtained.
`expected`             | Any type | A comparison value.
`message`&#160;*(optional)* | String   | An assertion message that will be displayed in the report if the test fails.
`options`&#160;*(optional)* | Object   | See [Options](README.md#assertion-options).

**Example:**

```js
await t.expect(2).lt(5, '2 is strictly less than 5');
```

```js
import { ClientFunction } from 'testcafe';

fixture `My fixture`;

test('My test', async t => {
    const fn = ClientFunction(param => param * 2);

    await t.expect(fn(3)).lt(12);
});
```

## Less than or Equal to

Asserts that `actual` is less than or equal to `expected`.

```text
await t.expect( actual ).lte( expected, message, options );
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------
`actual`             | Number &#124; Selector's Property &#124; ClientFunction | A value that should be less than or equal to `expected`. If you pass a [selector's property](../selecting-page-elements/selectors.md#define-assertion-actual-value) or a [client function](../obtaining-data-from-the-client.md) promise, the [Smart Assertion Query Mechanism](README.md#smart-assertion-query-mechanism) is activated and the assertion automatically waits until the `actual` value is obtained.
`expected`             | Any type | A comparison value.
`message`&#160;*(optional)* | String   | An assertion message that will be displayed in the report if the test fails.
`options`&#160;*(optional)* | Object   | See [Options](README.md#assertion-options).

**Examples:**

```js
await t
    .expect(2).lte(5, '2 is less or equal than 5')
    .expect(2).lte(2, '2 is less or equal than 2 ');
```

```js
import { ClientFunction } from 'testcafe';

fixture `My fixture`;

test('My test', async t => {
    const fn = ClientFunction(param => param * 2);

    await t.expect(fn(3)).lte(6);
});
```

## Within

Asserts that `actual` is within a range from `start` to `finish`. Bounds are inclusive.

```text
await t.expect( actual ).within( start, finish, message, options );
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------
`actual`             | Number &#124; Selector's Property &#124; ClientFunction | A comparison value. If you pass a [selector's property](../selecting-page-elements/selectors.md#define-assertion-actual-value) or a [client function](../obtaining-data-from-the-client.md) promise, the [Smart Assertion Query Mechanism](README.md#smart-assertion-query-mechanism) is activated and the assertion automatically waits until the `actual` value is obtained.
`start`             | Number | A lower bound of range (included).
`finish`             | Number | An upper bound of range (included).
`message`&#160;*(optional)* | String   | An assertion message that will be displayed in the report if the test fails.
`options`&#160;*(optional)* | Object   | See [Options](README.md#assertion-options).

**Example:**

```js
await t.expect(5).within(3, 10, 'this assertion will pass');
```

```js
import { ClientFunction } from 'testcafe';

fixture `My fixture`;

test('My test', async t => {
    const fn = ClientFunction(param => param * 2);

    await t.expect(fn(3)).within(3, 10);
});
```

## Not Within

Asserts that `actual` is not within a range from `start` to `finish`. Bounds are inclusive.

```text
await t.expect( actual ).notWithin( start, finish, message, options );
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------
`actual`             | Number &#124; Selector's Property &#124; ClientFunction | A comparison value. If you pass a [selector's property](../selecting-page-elements/selectors.md#define-assertion-actual-value) or a [client function](../obtaining-data-from-the-client.md) promise, the [Smart Assertion Query Mechanism](README.md#smart-assertion-query-mechanism) is activated and the assertion automatically waits until the `actual` value is obtained.
`start`             | Number | A lower bound of range (included).
`finish`             | Number | An upper bound of range (included).
`message`&#160;*(optional)* | String   | An assertion message that will be displayed in the report if the test fails.
`options`&#160;*(optional)* | Object   | See [Options](README.md#assertion-options).

**Example:**

```js
await t.expect(1).notWithin(3, 10, 'this assertion will pass');
```

```js
import { ClientFunction } from 'testcafe';

fixture `My fixture`;

test('My test', async t => {
    const fn = ClientFunction(param => param * 2);

    await t.expect(fn(3)).notWithin(10, 20);
});
```

## Match

Asserts that `actual` matches the `re` regular expression.

```text
await t.expect( actual ).match( re, message, options );
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------
`actual`             | String &#124; Selector's Property &#124; ClientFunction | A comparison value. If you pass a [selector's property](../selecting-page-elements/selectors.md#define-assertion-actual-value) or a [client function](../obtaining-data-from-the-client.md) promise, the [Smart Assertion Query Mechanism](README.md#smart-assertion-query-mechanism) is activated and the assertion automatically waits until the `actual` value is obtained.
`re`             | RegExp | A regular expression that is expected to match `actual`.
`message`&#160;*(optional)* | String   | An assertion message that will be displayed in the report if the test fails.
`options`&#160;*(optional)* | Object   | See [Options](README.md#assertion-options).

**Example:**

```js
await t.expect('foobar').match(/^f/, 'this assertion will be passed');
```

```js
import { ClientFunction } from 'testcafe';

fixture `My fixture`;

test('My test', async t => {
    const fn = ClientFunction(param => param + 'a');

    await t.expect(fn('foo')).match(/a$/);
});
```

## Not Match

Asserts that `actual` does not match the `re` regular expression.

```text
await t.expect( actual ).notMatch( re, message, options );
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------
`actual`             | String &#124; Selector's Property &#124; ClientFunction | A comparison value. If you pass a [selector's property](../selecting-page-elements/selectors.md#define-assertion-actual-value) or a [client function](../obtaining-data-from-the-client.md) promise, the [Smart Assertion Query Mechanism](README.md#smart-assertion-query-mechanism) is activated and the assertion automatically waits until the `actual` value is obtained.
`re`             | RegExp | A regular expression that is expected not to match `actual`.
`message`&#160;*(optional)* | String   | An assertion message that will be displayed in the report if the test fails.
`options`&#160;*(optional)* | Object   | See [Options](README.md#assertion-options).

**Example:**

```js
await t.expect('foobar').notMatch(/^b/, 'this assertion will be passed');
```

```js
import { ClientFunction } from 'testcafe';

fixture `My fixture`;

test('My test', async t => {
    const fn = ClientFunction(param => param + 'a');

    await t.expect(fn('foo')).notMatch(/^a/);
});
```