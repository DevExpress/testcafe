---
layout: docs
title: Type Text
permalink: /documentation/test-api/actions/type-text.html
checked: true
---
# Type Text

Types the specified text into an input element.

```text
t.typeText( selector, text [, options] )
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------
`selector`             | Function &#124; String &#124; Selector &#124; Snapshot &#124; Promise | Identifies the webpage element that will receive input focus. See [Selecting Target Elements](index.md#selecting-target-elements).
`text`                 | String                                            | The text to be typed into the specified webpage element.
`options`&#160;*(optional)* | Object                                            | A set of options that provide additional parameters for the action. See [Typing Action Options](action-options.md#typing-action-options). If this parameter is omitted, TestCafe sets the cursor to the end of the text before typing, thus preserving the text that is already in the input box.

> Use the [t.selectText](select-text.md) and [t.pressKey](press-key.md) actions to implement operations such as selecting or deleting text.

The following example shows how to use `t.typeText` with and without options.

```js
import { Selector } from 'testcafe';

const nameInput = Selector('#developer-name');

fixture `My fixture`
    .page `http://www.example.com/`;

test('Type and Replace', async t => {
    await t
        .typeText(nameInput, 'Peter')
        .typeText(nameInput, 'Paker', { replace: true })
        .typeText(nameInput, 'r', { caretPos: 2 })
        .expect(nameInput.value).eql('Parker');
});
```
