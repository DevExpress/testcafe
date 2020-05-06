---
layout: docs
title: t.pressKey Method
permalink: /documentation/reference/test-api/testcontroller/presskey.html
redirect_from:
  - /documentation/test-api/actions/press-key.html
---
# t.pressKey Method

Presses the specified keyboard keys.

```text
t.pressKey( keys [, options] )
```

Parameter | Type   | Description
--------- | ------ | --------------------------------------------------------
`keys`    | String | The sequence of keys and key combinations to be pressed.
`options`&#160;*(optional)*  | Object | A set of options that provide additional parameters for the action. See [Options](#options).

The following table shows how to specify keys of different types, key sequences, and combinations:

Key Type                   | Example
-------------------------- | ------
Alphanumeric keys          | `'a'`, `'A'`, `'1'`
Modifier keys              | `'shift'`, `'alt'` (⌥ key on macOS), `'ctrl'`, `'meta'` (*meta* key on Linux and ⌘ key on macOS)
Navigation and action keys | `'backspace'`, `'tab'`, `'enter'`
Key combinations           | `'shift+a'`, `'ctrl+d'`
Sequential key presses     | Any of the above in a string separated by spaces, for example, `'a ctrl+b'`

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

## Browser Processing Emulation

When a user presses a key or key combination, the browser dispatches an event that triggers handlers in page code. Most browsers also respond to common keystrokes with their integrated actions (for instance, they select text when you press `Cmd/Ctrl+A` or copy objects to the clipboard when you press `Cmd/Ctrl+C`).

The `t.pressKey` action triggers only page handlers for most keystrokes.

TestCafe Studio emulates browser processing for the following keys and key combinations:

Shortcut        | Elements
--------------- | -----------
`'ctrl+a'`      | [text field-based inputs](#text-field-based-inputs), `<textarea>`, `contentEditable`
`'backspace'`   | [text field-based inputs](#text-field-based-inputs), `<textarea>`, `contentEditable`
`'delete'`      | [text field-based inputs](#text-field-based-inputs), `<textarea>`, `contentEditable`
`'left'`        | [text field-based inputs](#text-field-based-inputs), radio button inputs, `<textarea>`, `<select>`, `contentEditable`
`'right'`       | [text field-based inputs](#text-field-based-inputs), radio button inputs, `<textarea>`, `<select>`, `contentEditable`
`'up'`          | [text field-based inputs](#text-field-based-inputs), radio button inputs, `<textarea>`, `<select>`
`'down'`        | [text field-based inputs](#text-field-based-inputs), radio button inputs, `<textarea>`, `<select>`
`'shift+left'`  | [text field-based inputs](#text-field-based-inputs), `<textarea>`
`'shift+right'` | [text field-based inputs](#text-field-based-inputs), `<textarea>`
`'shift+up'`    | [text field-based inputs](#text-field-based-inputs), `<textarea>`
`'shift+down'`  | [text field-based inputs](#text-field-based-inputs), `<textarea>`
`'home'`        | [text field-based inputs](#text-field-based-inputs), `<textarea>`
`'end'`         | [text field-based inputs](#text-field-based-inputs), `<textarea>`
`'shift+home'`  | [text field-based inputs](#text-field-based-inputs), `<textarea>`
`'shift+end'`   | [text field-based inputs](#text-field-based-inputs), `<textarea>`
`'enter'`       | [text field-based inputs](#text-field-based-inputs), `<textarea>`, `<select>`, `<a>`
`'tab'`         | focusable elements
`'shift+tab'`   | focusable elements
`'esc'`         | `<select>`

> The `'backspace'`, `'delete'`, `'left'` and `'right'` key presses in `contentEditable` elements are processed only when text is selected.

### Text Field-Based Inputs

TestCafe supports selection and navigation with keystrokes in the following input types:

* `email`
* `number`
* `password`
* `search`
* `tel`
* `text`
* `url`

## Example

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

## Options

{% include actions/basic-action-options.md %}
