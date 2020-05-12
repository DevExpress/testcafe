---
layout: docs
title: t.fixtureCtx Property
permalink: /documentation/reference/test-api/testcontroller/fixturectx.html
---
# t.fixtureCtx Property

Allows you to access the *fixture context* from test code. Use it to share variables between [fixture hook functions](../../../guides/basic-guides/organize-tests.md#fixture-hooks) and test code.

```text
t.fixtureCtx
```

Fixture hooks take the `ctx` parameter that allows you to access the fixture context.

```js
fixture `Fixture1`
    .before(async ctx  => {
        ctx.someProp = 123;
    })
    .after(async ctx  => {
        console.log(ctx.someProp); // > 123
    });
```

Test code can read the fixture context from `t.fixtureCtx`, assign values to its properties or add new properties, but it cannot overwrite the entire `t.fixtureCtx` object.

```js
fixture `Fixture1`
    .before(async ctx  => {
        ctx.someProp = 123;
    })
    .after(async ctx  => {
        console.log(ctx.newProp); // > abc
    });

test('Test1', async t => {
    console.log(t.fixtureCtx.someProp); // > 123
});

test('Test2', async t => {
    t.fixtureCtx.newProp = 'abc';
});
```
