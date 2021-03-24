---
layout: docs
title: t.scrollBy Method
permalink: /documentation/reference/test-api/testcontroller/scrollby.html
---
# t.scrollBy Method

{% include actions/manual-scroll-warning.md %}

Scrolls the `target` container. If no `target` is specified, scrolls the document body. Can be chained with other `TestController` methods.

```text
t.scrollBy([target], x[, y][, options]) → this | Promise<any>
t.scrollBy([target][, x], y[, options]) → this | Promise<any>
```

Parameter   | Type                                              | Description
----------- | ------------------------------------------------- | --------------------
`target`&#160;*(optional)* | Function &#124; String &#124; Selector &#124; Snapshot &#124; Promise | Identifies the webpage element to scroll to. See [Select Target Elements](#select-target-elements).
`x`&#160;*(optional)* | Number |
`y`&#160;*(optional)* | Number |
`options`&#160;*(optional)* | Object | A set of options with additional parameters for the action. See [Options](#options).

## Select Target Elements

{% include actions/selector-parameter.md %}

## Options

{% include actions/scroll-options.md %}
