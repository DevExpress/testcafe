---
layout: docs
title: Press Key
permalink: /documentation/test-api/actions/press-key.html
checked: true
---
# Press Key

Presses the specified keyboard keys.

```text
t.pressKey( keys [, options] )
```

Parameter | Type   | Description
--------- | ------ | --------------------------------------------------------
`keys`    | String | The sequence of keys and key combinations to be pressed.
`options`&#160;*(optional)*  | Object | A set of options that provide additional parameters for the action. See [Basic Action Options](action-options.md#basic-action-options).

The following table shows how to specify keys of different types, key sequences and combinations.

Key Type                   | Example
-------------------------- | ------
Alphanumeric keys          | `'a'`, `'A'`, `'1'`
Modifier keys              | `'shift'`, `'alt'` (⌥ key on macOS), `'ctrl'`, `'meta'` (*meta* key on Linux and ⌘ key on macOS)
Navigation and action keys | `'backspace'`, `'tab'`, `'enter'`
Key combinations           | `'shift+a'`, `'ctrl+d'`
Sequential key presses     | Any of the above in a space-separated string, e.g. `'a ctrl+b'`

The following navigation and action keys are supported:

* `'backspace'`
* `'tab'`
* `'enter'`
* `'capslock'`
* `'esc'`
* `'space'`
* `'pageup'`
* `'pagedown'`
* `'end'`
* `'home'`
* `'left'`
* `'right'`
* `'up'`
* `'down'`
* `'ins'`
* `'delete'`

When an end-user normally presses a key or key combination, the browser dispatches an event that triggers handlers in page code. Most browsers also respond to common keystrokes with their integrated actions (for instance, they select text when you press `Cmd/Ctrl+A` or copy objects to the clipboard when you press `Cmd/Ctrl+C`).

The `t.pressKey` action triggers only page handlers for most keystrokes. However, the following keys and key combinations additionally invoke browser processing:

* `'ctrl+a'`
* `'backspace'`
* `'delete'`
* `'left'`
* `'right'`
* `'up'`
* `'down'`
* `'home'`
* `'end'`
* `'enter'`
* `'tab'`
* `'shift+tab'`
* `'shift+left'`
* `'shift+right'`
* `'shift+up'`
* `'shift+down'`
* `'shift+home'`
* `'shift+end'`

For elements with the `contentEditable` attribute, the following key presses are supported:

* `'ctrl+a'`
* `'backspace'`
* `'delete'`
* `'left'`
* `'right'`

> The `'backspace'`, `'delete'`, `'left'` and `'right'` key presses in `contentEditable` elements are processed only when text is selected.

The following example shows how to use the `t.pressKey` action:

```js
import { Selector } from 'testcafe';

const nameInput = Selector('#developer-name');

fixture `My fixture`
    .page `http://www.example.com/`;

test('Key Presses', async t => {
    await t
        .typeText(nameInput, 'Peter Parker')
        .pressKey('home right . delete delete delete delete')
        .expect(nameInput.value).eql('P. Parker');
});
```
