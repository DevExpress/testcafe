---
layout: docs
title: t.dragToElement Method
permalink: /documentation/reference/test-api/testcontroller/dragtoelement.html
---
# t.dragToElement Method

Drags an element onto another web page element.

```text
t.dragToElement( selector, destinationSelector [, options] )
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------
`selector`             | Function &#124; String &#124; Selector &#124; Snapshot &#124; Promise | Identifies the webpage element being dragged. See [Selecting Target Elements](#selecting-target-elements).
`destinationSelector`  | Function &#124; String &#124; Selector &#124; Snapshot &#124; Promise | Identifies the webpage element that serves as the drop location. See [Selecting Target Elements](#selecting-target-elements).
`options`&#160;*(optional)* | Object                                            | A set of options that provide additional parameters for the action. See [DragToElement Action Options](#dragtoelement-action-options).

This sample shows how to drop an element into a specific area using the `t.dragToElement` action.

```js
import { ClientFunction } from 'testcafe';

fixture `My fixture`
    .page `http://www.example.com/`;

const designSurfaceItems = Selector('.design-surface').find('.items');

test('Drag an item from the toolbox', async t => {
    await t
        .dragToElement('.toolbox-item.text-input', '.design-surface')
        .expect(designSurfaceItems.count).gt(0);
});
```

## Selecting Target Elements

{% include actions/selector-options.md %}

## dragToElement Action Options

{% include actions/drag-to-element-options.md %}
