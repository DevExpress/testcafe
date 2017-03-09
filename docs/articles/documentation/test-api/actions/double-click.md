---
layout: docs
title: Double Click
permalink: /documentation/test-api/actions/double-click.html
checked: true
---
# Double Click

Double-clicks a webpage element.

```text
t.doubleClick( selector [, options] )
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------
`selector`             | Function &#124; String &#124; Selector &#124; Snapshot &#124; Promise | Identifies the webpage element being double-clicked. See [Selecting Target Elements](README.md#selecting-target-elements).
`options`&#160;*(optional)* | Object                                            | A set of options that provide additional parameters for the action. See [Click Action Options](action-options.md#click-action-options).

The following example shows how to use the `t.doubleClick` action to invoke a dialog.

```js
import { Selector } from 'testcafe';

const dialog = Selector('#dialog');

fixture `My fixture`
    .page `http://www.example.com/`;

test('Invoke Image Options Dialog', async t => {
    await t
        .doubleClick('#thumbnail')
        .expect(dialog.visible).ok();
});
```

> The `t.doubleClick` action will not invoke integrated browser actions such as text selection.
> Use it to perform double clicks that are processed by webpage elements, not the browser.
> To select text, use the [t.selectText](select-text.md) action or
> [emulate a key shortcut](press-key.md) with `t.pressKey('ctrl+a')`.
