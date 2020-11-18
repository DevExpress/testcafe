---
layout: docs
title: t.eval Method
permalink: /documentation/reference/test-api/testcontroller/eval.html
---
# t.eval Method

Creates a client function and executes it immediately (without saving). Returns a promise-wrapped value and cannot be chained with other methods of the test controller.

```text
t.eval(fn [, options]) → Promise<any>
```

Parameter              | Type     | Description
---------------------- | -------- | --------------------------------------------------------------------------
`fn`                   | Function | A function to be executed on the client side.
`options`&#160;*(optional)* | Object   | See [Options](#options).

The following example shows how to get a document's URI with `t.eval`.

```js
fixture `My fixture`
    .page `http://www.example.com/`;

test('My Test', async t => {
    const docURI = await t.eval(() => document.documentURI);
});
```

> Important! Always place `eval` in a separate call.
>
> `eval` returns a promise-wrapped value instead of a local context so you cannot chain other methods of the test controller after `eval`. If you chain `eval` on to other methods of the test controller, their promises don't ever resolve which breaks the execution order.

```js
fixture `My fixture`
    .page `https://devexpress.github.io/testcafe/example/`

const timeout = 1000;

test ('My Test', async t => {

    await t
    .wait(timeout)
    .eval(() => location.reload(true));
    // The timeout is skipped and the action executes right away.
    // Do not chain eval on to other methods of the test controller
});

test ('My Test', async t => {

    await t.wait(timeout);
    await t.eval(() => location.reload(true));
    // Passes after a timeout
});
```

## Options

{% include dependencies.md %}

{% include boundtestrun.md %}
