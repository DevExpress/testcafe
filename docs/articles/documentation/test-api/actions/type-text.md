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
`selector`             | Function &#124; String &#124; Selector &#124; Snapshot &#124; Promise | Identifies the webpage element that will receive input focus. See [Selecting Target Elements](README.md#selecting-target-elements).
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

## Typing Into DateTime, Color and Range Inputs

There are certain types of HTML5 inputs, like `DateTime`, `Color` or `Range`, that require entering values in a specific format.

The following table lists value formats expected by these inputs.

Input type | Pattern            | Example
---------- | ------------------ | ------------
Date       | `yyyy-mm-dd`       | `'2017-12-23'`
Week       | `yyyy-Www`         | `'2017-W03'`
Month      | `yyyy-mm`          | `'2017-08'`
DateTime   | `yyyy-mm-ddThh:mm` | `'2017-11-03T05:00'`
Time       | `hh:mm`            | `'15:30'`
Color      | `#rrggbb`          | `'#003000'`
Range      | `n`                | `'45'`