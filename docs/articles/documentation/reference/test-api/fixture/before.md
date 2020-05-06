---
layout: docs
title: Fixture.before Method
permalink: /documentation/reference/test-api/fixture/before.html
---
# Fixture.before Method

Executes code before the fixture starts (the *before* fixture hook).

```text
fixture.before( fn(ctx) )
```

Parameter | Type     | Description
--------- | -------- | ---------------------------------------------------------------------------
`fn`      | Function | An asynchronous hook function that contains the hook code.
`ctx`     | Object   | A *fixture context* object used to [share variables](../../../guides/basic-guides/organize-tests.md#share-variables-between-fixture-hooks-and-test-code) between fixture hooks and test code.

Unlike [test hooks](../../../guides/basic-guides/organize-tests.md#test-hooks), fixture hooks run between tests and do not have access to the tested page. Use them to perform server-side operations, like preparing the server that hosts the tested app.

```js
import { utils } from './my-utils.js';

fixture `My fixture`
    .page `http://example.com`
    .before( async ctx => {
        utils.populateDb(ctx.dbName);
    });
```

To execute code after the fixture finishes, use the [fixture.after](after.md) method.
