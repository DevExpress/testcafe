---
layout: docs
title: t.eval Method
permalink: /documentation/reference/test-api/testcontroller/eval.html
---
# t.eval Method

Creates a client function and executes it immediately (without saving).

```text
t.eval( fn [, options] )
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

> Since the `eval` method returns a value, and not an object, you cannot chain other methods of the test controller after 'eval'.

## Options

{% include dependencies.md %}

{% include boundtestrun.md %}
