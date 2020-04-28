---
layout: docs
title: t.hover Method
permalink: /documentation/reference/test-api/testcontroller/hover.html
redirect_from:
  - /documentation/test-api/actions/hover.html
---
# t.hover Method

Hovers the mouse pointer over a web page element.

```text
t.hover( selector [, options] )
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | -----------------------------------------------------------------------------------------------------------------------
`selector`             | Function &#124; String &#124; Selector &#124; Snapshot &#124; Promise | Identifies the webpage element being hovered over. See [Select Target Elements](#select-target-elements).
`options`&#160;*(optional)* | Object                                            | A set of options that provide additional parameters for the action. See [Options](#options).

Use this action to invoke popup elements such as hint windows, popup menus or dropdown lists that appear when hovering over other elements.

The following example shows how to move the mouse pointer over a combo box to display the dropdown list,
then select an item and check that the combo box value has changed.

```js
import { Selector } from 'testcafe';

const comboBox = Selector('.combo-box');

fixture `My fixture`
    .page `http://www.example.com/`;

test('Select combo box value', async t => {
    await t
        .hover(comboBox)
        .click('#i-prefer-both')
        .expect(comboBox.value).eql('Both');
});
```

## Select Target Elements

{% include actions/selector-parameter.md %}

## Options

{% include actions/mouse-options.md %}
