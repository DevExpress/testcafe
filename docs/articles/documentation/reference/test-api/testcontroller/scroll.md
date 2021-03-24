---
layout: docs
title: t.scroll Method
permalink: /documentation/reference/test-api/testcontroller/scroll.html
---
# t.scroll Method

{% include actions/manual-scroll-warning.md %}

Scrolls the `target` container. If no `target` is specified, scrolls the document body. Can be chained with other `TestController` methods.

```text
t.scroll([target][, x][, y][, options])   → this | Promise<any>
t.scroll([target][, position][, options]) → this | Promise<any>
t.scroll(target[, positionIdentifier])    → this | Promise<any>
```

Parameter   | Type/Value                                        | Description
----------- | ------------------------------------------------- | --------------------
`target`&#160;*(optional)* | Function &#124; String &#124; Selector &#124; Snapshot &#124; Promise | Identifies the webpage element to scroll to. See [Select Target Elements](#select-target-elements).
`x`&#160;*(optional)* | Number |
`y`&#160;*(optional)* | Number |
`position`&#160;*(optional)*| Object |
`positionIdentifier`&#160;*(optional)*| 'left' &#124; 'right' &#124; 'bottom' &#124; 'topLeft' &#124; 'topRight' &#124; 'bottomLeft' &#124; 'bottomRight' &#124; 'center'
`options`&#160;*(optional)* | Object | A set of options with additional parameters for the action. See [Options](#options).

## Select Target Elements

{% include actions/selector-parameter.md %}

## Options

{% include actions/scroll-options.md %}
