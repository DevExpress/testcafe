---
layout: docs
title: ClientFunction Object
permalink: /documentation/reference/test-api/clientfunction/
---
# ClientFunction Object

A [client function](../../../guides/basic-guides/obtain-client-side-info.md) that can return any serializable value from the client side.

Use the [ClientFunction](constructor.md) constructor to create a client function.

```js
import { ClientFunction } from 'testcafe';
const getWindowLocation = ClientFunction(() => window.location);
```

Call the client function with the `await` keyword to execute it.

```js
import { ClientFunction } from 'testcafe';

const getWindowLocation = ClientFunction(() => window.location);

fixture `My fixture`
    .page `http://www.example.com/`;

test('My Test', async t => {
    const location = await getWindowLocation();
});
```

You can overwrite client function options via the ClientFunction's [with](with.md) method.

For more information, see [Obtain Client-Side Info](../../../guides/basic-guides/obtain-client-side-info.md).
