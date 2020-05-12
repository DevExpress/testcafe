---
layout: docs
title: Fixture.after Method
permalink: /documentation/reference/test-api/fixture/after.html
---
# Fixture.after Method

Executes the code after the fixture finishes (the *after* fixture hook).

```text
fixture.after( fn(ctx) )
```

Parameter | Type     | Description
--------- | -------- | ---------------------------------------------------------------------------
`fn`      | Function | An asynchronous hook function that contains the hook code.
`ctx`     | Object   | A *fixture context* object used to [share variables](../../../guides/basic-guides/organize-tests.md#share-variables-between-fixture-hooks-and-test-code) between fixture hooks and test code.

Unlike [test hooks](../../../guides/basic-guides/organize-tests.md#test-hooks), fixture hooks run between tests and do not have access to the tested page. Use them to perform server-side operations like preparing the server that hosts the tested app.

```js
import { utils } from './my-utils.js';

fixture `My fixture`
    .page `http://example.com`
    .after( async ctx => {
        utils.dropDb(ctx.dbName);
    });
```

To execute code before the fixture starts, use the [fixture.before](before.md) method.
