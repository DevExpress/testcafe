---
layout: docs
title: t.scrollBy Method
permalink: /documentation/reference/test-api/testcontroller/scrollby.html
---
# t.scrollBy Method

{% include actions/manual-scroll-warning.md %}

Scrolls the `target` element by the given amount of pixels. If no `target` is specified, scrolls the document body. Can be chained with other `TestController` methods.

```text
t.scrollBy([target,] x, y[, options]) → this | Promise<any>
```

Parameter   | Type                                              | Description
----------- | ------------------------------------------------- | --------------------
`target`&#160;*(optional)*  | Function &#124; String &#124; Selector &#124; Snapshot &#124; Promise | Identifies the webpage element to scroll to. See [Select Target Elements](#select-target-elements).
`x`&#160;                   | Number | The amount (in pixels) TestCafe scrolls the element from left to right. Can be negative.
`y`&#160;                   | Number | The amount (in pixels) TestCafe scrolls the element from the top down. Can be negative.
`options`&#160;*(optional)* | Object | A set of options with additional parameters for the action. See [Options](#options).

In the example below, TestCafe scrolls the webpage *up* by 200px and *to the right* by 500px:

```js
import 'testcafe'

fixture`Scroll Action`
    .page('http://example.com');

test('Scroll the webpage', async t => {
    await t
        .scrollBy(500, -200)
});

```

## Select Target Elements

{% include actions/selector-parameter.md %}

## Options

{% include actions/offset-options.md %}
