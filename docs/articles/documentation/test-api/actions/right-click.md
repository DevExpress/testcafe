---
layout: docs
title: Right Click
permalink: /documentation/test-api/actions/right-click.html
---
# Right Click

Right-clicks a webpage element.

```text
t.rightClick( selector [, options] )
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------
`selector`             | Function &#124; String &#124; Selector &#124; Snapshot &#124; Promise | Identifies the webpage element being right-clicked. See [Selecting Target Elements](index.md#selecting-target-elements).
`options` *(optional)* | Object                                            | A set of options that provide additional parameters for the action. See [Click Action Options](action-options.md#click-action-options).

The following example shows how to use the `t.rightClick` action to invoke grid's popup menu.

```js
import { expect } from 'chai';

fixture `My fixture`
    .page('http://www.example.com/');

test('Popup Menu', async t => {
    await t.rightClick('#cell-1-1');

    expect(await t.select('#cell-popup-menu')).to.be.null;
});
```

> The `t.rightClick` action will not invoke integrated browser context menus, native editor menus, etc.
> Use it to perform right clicks that are processed by webpage elements, not the browser.