---
layout: docs
title: t.drag Method
permalink: /documentation/reference/test-api/testcontroller/drag.html
---
# t.drag Method

Drags an element to a specified offset.

```text
t.drag( selector, dragOffsetX, dragOffsetY [, options] )
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------
`selector`             | Function &#124; String &#124; Selector &#124; Snapshot &#124; Promise | Identifies the webpage element being dragged. See [Select Target Elements](#select-target-elements).
`dragOffsetX`          | Number                                            | An X-offset of the drop coordinates from the mouse pointer's initial position.
`dragOffsetY`          | Number                                            | An Y-offset of the drop coordinates from the mouse pointer's initial position.
`options`&#160;*(optional)* | Object                                            | A set of options that provide additional parameters for the action. See [Options](#options).

The following example demonstrates how to use the `t.drag` action with a slider:

```js
import { Selector } from 'testcafe';

const slider = Selector('#developer-rating');

fixture `My fixture`
    .page `http://www.example.com/`;

test('Drag slider', async t => {
    await t
        .click('#i-tried-testcafe');
        .expect(slider.value).eql(1)
        .drag('.ui-slider-handle', 360, 0, { offsetX: 10, offsetY: 10 })
        .expect(slider.value).eql(7);
});
```

You can use the [t.dragToElement](dragtoelement.md) method to drag an element onto another element on the page.

## Select Target Elements

{% include actions/selector-parameter.md %}

## Options

{% include actions/mouse-options.md %}
