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
`actual`             | Any type | A comparison value.
`expected`             | Any type | An expected value.
`message`&#160;*(optional)* | String   | An assertion message that will be displayed in the report if the test fails.
`options`&#160;*(optional)* | Object   | See [Options](index.md#assertion-options).

**Examples:**

```js
await t
    .expect({ a: 'bar' }).eql({ a: 'bar' }, 'this assertion will be passed')
    .expect({ a: 'bar' }).eql({ a: 'foo' }, 'this assertion will be failed');
```

## Not Deep Equal

Assert that `actual` is not deeply equal to `unexpected`.

```text
await t.expect( actual ).notEql( unexpected, message, options );
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------
`actual`             | Any type | A comparison value.
`expected`             | Any type | An unexpected value.
`message`&#160;*(optional)* | String   | An assertion message that will be displayed in the report if the test fails.
`options`&#160;*(optional)* | Object   | See [Options](index.md#assertion-options).

**Examples:**

```js
await t
    .expect({ a: 'bar' }).notEql({ a: 'bar' }, 'this assertion will be failed')
    .expect({ a: 'bar' }).notEql({ a: 'foo' }, 'this assertion will be passed');
```

## Ok

Asserts that `actual` is truthy.

```text
await t.expect( actual ).ok( message, options );
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------
`actual`             | Any type | A value that should be truthy.
`message`&#160;*(optional)* | String   | An assertion message that will be displayed in the report if the test fails.
`options`&#160;*(optional)* | Object   | See [Options](index.md#assertion-options).

**Examples:**

```js
await t
    .expect('ok').ok('this assertion will be passed')
    .expect(false).ok('this assertion will be failed');
```

## Not Ok

Asserts that `actual` is falsy.

```text
await t.expect( actual ).notOk( message, options );
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------
`actual`             | Any type | A value that should be falsy.
`message`&#160;*(optional)* | String   | An assertion message that will be displayed in the report if the test fails.
`options`&#160;*(optional)* | Object   | See [Options](index.md#assertion-options).

**Examples:**

```js
await t
    .expect('ok').notOk('this assertion will be failed')
    .expect(false).notOk('this assertion will be passed');
```

## Contains

Asserts that `actual` contains `expected`.

```text
await t.expect( actual ).contains( expected, message, options );
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------
`actual`             | String &#124; Array | A String or Array that should contain an `expected` value.
`expected`             | Any type | An expected value.
`message`&#160;*(optional)* | String   | An assertion message that will be displayed in the report if the test fails.
`options`&#160;*(optional)* | Object   | See [Options](index.md#assertion-options).

**Examples:**

```js
await t
    .expect('foo bar').contains('bar', 'actual string contains expected')
    .expect([1, 2, 3]).contains(2, 'actual array contains expected');
```

## Not Contains

Asserts that `actual` does not contain `expected`.

```text
await t.expect( actual ).notContains( expected, message, options );
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------
`actual`             | String &#124; Array | A String or Array that should not contain an `expected` value.
`expected`             | Any type | An expected value.
`message`&#160;*(optional)* | String   | An assertion message that will be displayed in the report if the test fails.
`options`&#160;*(optional)* | Object   | See [Options](index.md#assertion-options).

**Examples:**

```js
await t
    .expect('foo bar').notContains('baz', 'actual string do not contains expected')
    .expect([1, 2, 3]).notContains(4, 'actual array contains expected');
```

## Type Of

Asserts that type of `actual` is `typeName`.

```text
await t.expect( actual ).typeOf( typeName, message, options );
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------
`actual`             | Any type | A comparison value.
`typeName`             | String | The expected type of an `actual` value.
`message`&#160;*(optional)* | String   | An assertion message that will be displayed in the report if the test fails.
`options`&#160;*(optional)* | Object   | See [Options](index.md#assertion-options).

**Examples:**

```js
await t
    .expect({ a: 'bar' }).typeOf('object', 'it\'s an object')
    .expect(/bar/).typeOf('regexp', 'it\'s a regular expression')
    .expect(null).typeOf('null', 'it\'s a null');
```

## Not Type of

Asserts that type of `actual` is not `typeName`.

```text
await t.expect( actual ).notTypeOf( typeName, message, options );
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------
`actual`             | Any type | A comparison value.
`typeName`             | String | An unexpected type of `actual` value.
`message`&#160;*(optional)* | String   | An assertion message that will be displayed in the report if the test fails.
`options`&#160;*(optional)* | Object   | See [Options](index.md#assertion-options).

**Example:**

```js
await t.expect('bar').notTypeOf('number', 'string is not a number');
```

## Great than

Asserts that `expected` is strictly greater than `actual`.

```text
await t.expect( actual ).gt( expected, message, options );
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------
`actual`             | Any type | A comparison value.
`expected`             | Any type | A value that should be greater than `actual`.
`message`&#160;*(optional)* | String   | An assertion message that will be displayed in the report if the test fails.
`options`&#160;*(optional)* | Object   | See [Options](index.md#assertion-options).

**Example:**

```js
await t.expect(5).gt(2, '5 is strictly greater than 2');
```

## Great than or Equal to

Asserts that `expected` is greater than or equal to `actual`.

```text
await t.expect( actual ).gte( expected, message, options );
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------
`actual`             | Any type | A comparison value.
`expected`             | Any type | A value that should be greater than or equal to `actual`.
`message`&#160;*(optional)* | String   | An assertion message that will be displayed in the report if the test fails.
`options`&#160;*(optional)* | Object   | See [Options](index.md#assertion-options).

**Examples:**

```js
await t
    .expect(5).gte(2, '5 is greater or equal than 2')
    .expect(2).gte(2, '2 is greater or equal than 2 ');
```

## Less than

Asserts that `expected` is strictly less than `actual`.

```text
await t.expect( actual ).lt( expected, message, options );
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------
`actual`             | Any type | A comparison value.
`expected`             | Any type | A value that should be less than `actual`.
`message`&#160;*(optional)* | String   | An assertion message that will be displayed in the report if the test fails.
`options`&#160;*(optional)* | Object   | See [Options](index.md#assertion-options).

**Example:**

```js
await t.expect(2).lt(5, '2 is strictly less than 5');
```

## Less than or Equal to

Asserts that `expected` is less than or equal to `actual`.

```text
await t.expect( actual ).lte( expected, message, options );
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------
`actual`             | Any type | A comparison value.
`expected`             | Any type | A value that should be less than or equal to `actual`.
`message`&#160;*(optional)* | String   | An assertion message that will be displayed in the report if the test fails.
`options`&#160;*(optional)* | Object   | See [Options](index.md#assertion-options).

**Examples:**

```js
await t
    .expect(2).lte(5, '2 is less or equal than 5')
    .expect(2).lte(2, '2 is less or equal than 2 ');
```

## Within

Asserts that `actual` is within a range from `start` to `finish`. Bounds are inclusive.

```text
await t.expect( actual ).within( start, finish, message, options );
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------
`actual`             | Any type | A comparison value.
`start`             | Number | A lower bound of range (included).
`finish`             | Number | An upper bound of range (included).
`message`&#160;*(optional)* | String   | An assertion message that will be displayed in the report if the test fails.
`options`&#160;*(optional)* | Object   | See [Options](index.md#assertion-options).

**Example:**

```js
await t.expect(5).within(3, 10, 'this assertion will be passed');
```

## Not Within

Asserts that `actual` is not within a range from `start` to `finish`. Bounds are inclusive.

```text
await t.expect( actual ).notWithin( start, finish, message, options );
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------
`actual`             | Any type | A comparison value.
`start`             | Number | A lower bound of range (included).
`finish`             | Number | An upper bound of range (included).
`message`&#160;*(optional)* | String   | An assertion message that will be displayed in the report if the test fails.
`options`&#160;*(optional)* | Object   | See [Options](index.md#assertion-options).

**Example:**

```js
await t.expect(1).notWithin(3, 10, 'this assertion will be passed');
```

## Match

Asserts that `actual` matches the `re` regular expression.

```text
await t.expect( actual ).match( re, message, options );
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------
`actual`             | String | A comparison value.
`re`             | RegExp | A regular expression that is expected to match `actual`.
`message`&#160;*(optional)* | String   | An assertion message that will be displayed in the report if the test fails.
`options`&#160;*(optional)* | Object   | See [Options](index.md#assertion-options).

**Example:**

```js
await t.expect('foobar').match(/^f/, 'this assertion will be passed');
```

## Not Match

Asserts that `actual` does not match the `re` regular expression.

```text
await t.expect( actual ).notMatch( re, message, options );
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------
`actual`             | String | A comparison value.
`re`             | RegExp | A regular expression that is expected not to match `actual`.
`message`&#160;*(optional)* | String   | An assertion message that will be displayed in the report if the test fails.
`options`&#160;*(optional)* | Object   | See [Options](index.md#assertion-options).

**Example:**

```js
await t.expect('foobar').notMatch(/^b/, 'this assertion will be passed');
```