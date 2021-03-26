---
layout: docs
title: t.scroll Method
permalink: /documentation/reference/test-api/testcontroller/scroll.html
---
# t.scroll Method

{% include actions/manual-scroll-warning.md %}

Scrolls the `target` element to a specified position. If no `target` is specified, scrolls the document body. Can be chained with other `TestController` methods.

## Syntax

### scroll(posX, posY)

```text
t.scroll([target,] posX, posY[, options]) → this | Promise<any>
```

Parameter   | Type/Value                                        | Description
----------- | ------------------------------------------------- | --------------------
`target`&#160;*(optional)* | Function &#124; String &#124; Selector &#124; Snapshot &#124; Promise | Identifies the webpage element to scroll. If unspecified, TestCafe scrolls the document body. See [Select Target Elements](#select-target-elements).
`posX`&#160;               | Number | TestCafe scrolls the element to this position on the horizontal axis.
`posY`&#160;               | Number | TestCafe scrolls the element to this position on the vertical axis.
`options`&#160;*(optional)*| Object | A set of options with additional parameters for the action. See [Options](#options).

### scroll(position)

```text
t.scroll([target,] position[, options]) → this | Promise<any>
```

Parameter   | Type/Value                                        | Description
----------- | ------------------------------------------------- | --------------------
`target`&#160;*(optional)* | Function &#124; String &#124; Selector &#124; Snapshot &#124; Promise | Identifies the webpage element to scroll. If unspecified, TestCafe scrolls the document body. See [Select Target Elements](#select-target-elements).
`position`&#160;           | 'left' &#124; 'right' &#124; 'bottom' &#124; 'topLeft' &#124; 'topRight' &#124; 'bottomLeft' &#124; 'bottomRight' &#124; 'center'| TestCafe scrolls the element to this position.
`options`&#160;*(optional)*| Object | A set of options with additional parameters for the action. See [Options](#options).

## Example

In the example below, TestCafe scrolls the target container to its bottom right.

```js
import { Selector } from 'testcafe';

fixture`Scroll Action`
    .page('http://example.com');

test('Scroll the container', async t => {
    const container = Selector('#container');

    await t
        .scroll(container, 'bottomRight')
});
```

## Select Target Elements

{% include actions/selector-parameter.md %}

## Options

{% include actions/offset-options.md %}
