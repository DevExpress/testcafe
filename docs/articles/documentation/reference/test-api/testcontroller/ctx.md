---
layout: docs
title: t.ctx Property
permalink: /documentation/reference/test-api/testcontroller/ctx.html
---
# t.ctx Property

Allows you to access the *test context*. Use it to share variables between test hook functions and test code.

```text
t.ctx
```

Assign the object you want to share to `t.ctx` or create a property as in the following example:

```js
fixture `Fixture1`
    .beforeEach(async t  => {
        t.ctx.someProp = 123;
    });

test
    ('Test1', async t => {
        console.log(t.ctx.someProp); // > 123
    })
    .after(async t => {
         console.log(t.ctx.someProp); // > 123
    });
```

Each test run has its own test context.

> `t.ctx` is initialized with an empty object without a prototype. You can iterate its keys without the `hasOwnProperty` check.
