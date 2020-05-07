---
layout: docs
title: Test.meta Method
permalink: /documentation/reference/test-api/test/meta.html
---
# Test.meta Method

Specifies the [test's metadata](../../../guides/basic-guides/organize-tests.md#specify-test-metadata).

```text
test.meta( name, value )
test.meta( metadata )
```

Parameter  | Type   | Description
---------- | ------ | -----------------
`name`     | String | The name of the metadata entry.
`value`    | String | The value of the metadata entry.
`metadata` | Object | Key-value pairs.

Metadata is additional information assigned to tests and fixtures. It can be used to filter tests or displayed in the reports. Metadata is specified as key-value pairs.

```js
test.meta('key1', 'value1');
```

```js
test.meta({ key1: 'value1', key2: 'value2', key3: 'value3' });
```

To specify metadata for fixtures, use the [fixture.meta](../fixture/meta.md) method.
