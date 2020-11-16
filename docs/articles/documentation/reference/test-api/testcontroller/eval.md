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

> Important! Since `eval` returns a promise-wrapped value instead of a local context, you cannot chain other methods of the test controller after `eval`.
>
> Always place `eval` in a separate call.

## Options

{% include dependencies.md %}

{% include boundtestrun.md %}
