---
layout: docs
title: Press Key
permalink: /documentation/test-api/actions/press-key.html
---
# Press Key

Presses the specified keyboard keys.

```text
t.pressKey( keys )
```

Parameter | Type   | Description
--------- | ------ | --------------------------------------------------------
`keys`    | String | The sequence of keys and key combinations to be pressed.

* Alphanumeric keys  
  `'a', 'A', '1', ...`
* Modifier keys  
  `'shift', 'alt', 'ctrl', 'meta'`
* Navigation and action keys  
  `'backspace', 'tab', 'enter', 'capslock', 'esc', 'space', 'pageup', 'pagedown', 'end', 'home', 'left', 'right', 'down', 'ins', 'delete'`
* Key combinations  
  `'shift+a', 'ctrl+d', ...`
* Sequential key presses (any of the above in a space-separated string)  
  `'a ctrl+b'`

In addition to key presses handled by webpage elements, TestCafe also allows you to execute certain key presses processed by the browser.

* `'ctrl+a', 'backspace', 'delete', 'left', 'right', 'up', 'down', 'home', 'end', 'enter', 'tab', 'shift+tab', 'shift+left', 'shift+right', 'shift+up', 'shift+down', 'shift+home', 'shift+end'`

With the exception of the keys and combinations listed above, the `t.pressKey` action will not invoke integrated browser keystrokes.

For web elements that have the `contentEditable` attribute, TestCafe supports the following key-presses:

* `'ctrl+a',`
* `'backspace', 'delete', 'left'` and `'right'` (only if there is selection within the element).

The following example shows how to use the `t.pressKey` action.

```js
import { expect } from 'chai';

fixture `My fixture`
    .page('http://www.example.com/');

test('Key Presses', async t => {
    await t
        .typeText('#developer-name', 'Peter Parker')
        .pressKey('home right . delete delete delete delete');

    const input = await t.select('#developer-name');

    expect(input.value).to.equal('P. Parker');
});
```