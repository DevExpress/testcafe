---
layout: docs
title: ClientFunction Constructor
permalink: /documentation/reference/test-api/clientfunction/constructor.html
---
# ClientFunction Constructor

Creates a [client function](../../../guides/basic-guides/obtain-client-side-info.md).

```text
ClientFunction( fn [, options] )
```

Parameter              | Type     | Description
---------------------- | -------- | ---------------------------------------------
`fn`                   | Function | A function to be executed on the client side.
`options`&#160;*(optional)* | Object   | See [Options](#options).

> Client functions cannot return DOM nodes. Use [selectors](../../../guides/basic-guides/select-page-elements.md) instead.

The following example shows how to create a client function.

```js
import { ClientFunction } from 'testcafe';

const getWindowLocation = ClientFunction(() => window.location);
```

## Options

{% include dependencies.md %}

{% include boundtestrun.md %}
