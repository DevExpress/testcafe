---
layout: docs
title: t.rightClick Method
permalink: /documentation/reference/test-api/testcontroller/rightclick.html
checked: true
---
# t.rightClick Method

Right-clicks a web page element.

```text
t.rightClick( selector [, options] )
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------
`selector`             | Function &#124; String &#124; Selector &#124; Snapshot &#124; Promise | Identifies the webpage element being right-clicked. See [Selecting Target Elements](#selecting-target-elements).
`options`&#160;*(optional)* | Object                                            | A set of options that provide additional parameters for the action. See [Click Action Options](#click-action-options).

The following example shows how to use the `t.rightClick` action to invoke a grid's popup menu.

```js
import { Selector } from 'testcafe';

fixture `My fixture`
    .page `http://www.example.com/`;

test('Popup Menu', async t => {
    await t
        .rightClick('#cell-1-1')
        .expect(Selector('#cell-popup-menu').exists).notOk();
});
```

> The `t.rightClick` action will not invoke integrated browser context menus, native editor menus, etc.
> Use it to perform right clicks that are processed by webpage elements, not the browser.

## Selecting Target Elements

{% include actions/selector-options.md %}

## Click Action Options

{% include actions/click-options.md %}
