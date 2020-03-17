---
layout: docs
title: t.doubleClick Method
permalink: /documentation/reference/test-api/testcontroller/doubleclick.html
---
# t.doubleClick Method

Double-clicks an element on a page.

```text
t.doubleClick( selector [, options] )
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------
`selector`             | Function &#124; String &#124; Selector &#124; Snapshot &#124; Promise | Identifies the webpage element being double-clicked. See [Select Target Elements](#select-target-elements).
`options`&#160;*(optional)* | Object                                            | A set of options that provide additional parameters for the action. See [Options](#options).

The following example shows how to use the `t.doubleClick` action to invoke a dialog:

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
> To select text, use the [t.selectText](selecttext.md) action or
> [emulate a key shortcut](presskey.md) with `t.pressKey('ctrl+a')`.

## Select Target Elements

{% include actions/selector-options.md %}

## Options

{% include actions/click-options.md %}
