---
layout: docs
title: Type Text
permalink: /documentation/test-api/actions/type-text.html
---
# Type Text

Types the specified text into a webpage element.

```text
t.typeText( selector, text [, options] )
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------
`selector`             | Function &#124; String &#124; Selector &#124; Snapshot &#124; Promise | Identifies the webpage element that will receive input focus. See [Selecting Target Elements](index.md#selecting-target-elements).  
`text`                 | String                                            | The text to be typed into the specified webpage element.
`options` *(optional)* | Object                                            | A set of options that provide additional parameters for the action. See [Typing Action Options](action-options.md#typing-action-options). If this parameter is omitted, TestCafe sets the cursor to the end of the text before typing, thus preserving the text that is already in the edit box.

> Use the [t.pressKey](press-key.md) action to implement text management operations such as selection or deletion.

The following example shows how to use `t.typeText` with and without options.

```js
import { expect } from 'chai';

fixture `My fixture`
    .page('http://www.example.com/');

test('Type and Replace', async t => {
    await t
        .typeText('#developer-name', 'Peter')
        .typeText('#developer-name', 'Paker', { replace: true })
        .typeText('#developer-name', 'r', { caretPos: 2 });

    const input = await t.select('#developer-name');

    expect(input.value).to.equal('Parker');
});
```
