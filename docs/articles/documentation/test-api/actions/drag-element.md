---
layout: docs
title: Drag Element
permalink: /documentation/test-api/actions/drag-element.html
checked: true
---
# Drag Element

There are two ways to drag a page element.

* [Drag an Element by an Offset](#drag-an-element-by-an-offset)
* [Drag an Element onto Another One](#drag-an-element-onto-another-one)

> The `t.drag` or `t.dragToElement` actions will not invoke integrated browser actions such as selecting text.
> Use them to perform drag-and-drop actions that are processed by webpage elements, not the browser.
> To select text, use [t.selectText](select-text.md).

## Drag an Element by an Offset

```text
t.drag( selector, dragOffsetX, dragOffsetY [, options] )
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------
`selector`             | Function &#124; String &#124; Selector &#124; Snapshot &#124; Promise | Identifies the webpage element being dragged. See [Selecting Target Elements](README.md#selecting-target-elements).
`dragOffsetX`          | Number                                            | An X-offset of the drop coordinates from the mouse pointer's initial position.
`dragOffsetY`          | Number                                            | An Y-offset of the drop coordinates from the mouse pointer's initial position.
`options`&#160;*(optional)* | Object                                            | A set of options that provide additional parameters for the action. See [Mouse Action Options](action-options.md#mouse-action-options).

The following example demonstrates how to use the `t.drag` action with a slider.

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

## Drag an Element onto Another One

```text
t.dragToElement( selector, destinationSelector [, options] )
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------
`selector`             | Function &#124; String &#124; Selector &#124; Snapshot &#124; Promise | Identifies the webpage element being dragged. See [Selecting Target Elements](README.md#selecting-target-elements).
`destinationSelector`  | Function &#124; String &#124; Selector &#124; Snapshot &#124; Promise | Identifies the webpage element that serves as the drop location. See [Selecting Target Elements](README.md#selecting-target-elements).
`options`&#160;*(optional)* | Object                                            | A set of options that provide additional parameters for the action. See [DragToElement Action Options](action-options.md#dragtoelement-action-options).

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
