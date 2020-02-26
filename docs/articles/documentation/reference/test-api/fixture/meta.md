---
layout: docs
title: Fixture.meta Method
permalink: /documentation/reference/test-api/fixture/meta.html
---
# Fixture.meta Method

Specifies the [fixture's metadata](../../../guides/basic-guides/test-organization.md#specify-test-metadata).

```text
fixture.meta( name, value )
fixture.meta( metadata )
```

Parameter  | Type   | Description
---------- | ------ | -----------------
`name`     | String | The name of the metadata entry.
`value`    | String | The value of the metadata entry.
`metadata` | Object | Key-value pairs.

Metadata is additional information assigned to tests and fixtures. It can be used to filter tests or displayed in the reports. Metadata is specified as key-value pairs.

```js
fixture.meta('key1', 'value1');
```

```js
fixture.meta({ key1: 'value1', key2: 'value2', key3: 'value3' });
```

To specify metadata for individual tests, use the [test.meta](../test/meta.md) method.
