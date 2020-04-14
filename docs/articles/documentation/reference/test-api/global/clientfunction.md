---
layout: docs
title: ClientFunction Constructor
permalink: /documentation/reference/test-api/global/clientfunction.html
---
# Client Function Constructor

Creates a client function.

```text
ClientFunction( fn [, options] )
```

Parameter              | Type     | Description
---------------------- | -------- | ---------------------------------------------
`fn`                   | Function | A function to be executed on the client side.
`options`&#160;*(optional)* | Object   | See [Options](#options).

> Client functions cannot return DOM nodes. Use [selectors](../selecting-page-elements/selectors/README.md) instead.

The following example shows how to create a client function.

```js
import { ClientFunction } from 'testcafe';

const getWindowLocation = ClientFunction(() => window.location);
```

## Options

{% include dependencies.md %}

{% include boundtestrun.md %}
