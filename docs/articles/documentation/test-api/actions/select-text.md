---
layout: docs
title: Select Text
permalink: /documentation/test-api/actions/select-text.html
checked: true
---
# Select Text

TestCafe allows you to select text within inputs, `<textarea>` and `contentEditable` elements.

* [Select Text in Input Elements](#select-text-in-input-elements)
* [Select \<textarea\> Content](#select-textarea-content)
* [Perform Selection within Editable Content](#perform-selection-within-editable-content)

## Select Text in Input Elements

`t.selectText` selects text in input elements of various types.

```text
t.selectText( selector [, startPos] [, endPos] )
```

Parameter               | Type                                              | Description                                                                                                                                          | Default
----------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------
`selector`              | Function &#124; String &#124; Selector &#124; Snapshot &#124; Promise | Identifies the webpage element whose text will be selected. See [Selecting Target Elements](index.md#selecting-target-elements).
`startPos`&#160;*(optional)* | Number                                            | The start position of the selection. Must be a positive integer or `0`.                                                                              | `0`
`endPos`&#160;*(optional)*   | Number                                            | The end position of the selection. Must be a positive integer or `0`.                                                                                | Length of the visible text content.

> You can use `t.selectText` for `<textarea>` and `contentEditable` elements as well. However, the [t.selectTextAreaContent](#select-textarea-content)
> and [t.selectEditableContent](#perform-selection-within-editable-content) actions allow you to specify the selection range
> in a way that is more relevant for these elements.

The following example demonstrates text selection in an input element.

```js
import { expect } from 'chai';
import { ClientFunction } from 'testcafe';

fixture `My fixture`
    .page('http://www.example.com/');

const getElementSelectionStart = ClientFunction(id => document.getElementById(id).selectionStart);
const getElementSelectionEnd   = ClientFunction(id => document.getElementById(id).selectionEnd);

test('Select text within input', async t => {
    await t
        .typeText('#developer-name', 'Test Cafe', { caretPos: 0 })
        .selectText('#developer-name', 7, 1);

    expect(await getElementSelectionStart('developer-name')).to.equal(1);
    expect(await getElementSelectionEnd('developer-name')).to.equal(7);
});
```

> If the `startPos` value is greater than the `endPos` value, the action will perform a backward selection.

## Select \<textarea\> Content

```text
t.selectTextAreaContent( selector [, startLine] [, startPos] [, endLine] [, endPos] )
```

Parameter  | Type                                              | Description                                                                                                                                   | Default
---------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | -------
`selector` | Function &#124; String &#124; Selector &#124; Snapshot &#124; Promise | Identifies the `<textarea>` whose text will be selected. See [Selecting Target Elements](index.md#selecting-target-elements).
`startLine`&#160;*(optional)* | Number                                            | The line number at which selection starts. Must be a positive integer or `0`.                                               | `0`
`startPos`&#160;*(optional)*  | Number                                            | The start position of selection within the line defined by the `startLine`. Must be a positive integer or `0`.                  | `0`
`endLine`&#160;*(optional)*   | Number                                            | The line number at which selection ends. Must be a positive integer or `0`.                                                 | The index of the last line.
`endPos`&#160;*(optional)*    | Number                                            | The end position of selection within the line defined by `endLine`. Must be a positive integer or `0`.                          | The last position in `endLine`.

The following example shows how to select text within a `<textarea>` element.

```js
import { expect } from 'chai';
import { ClientFunction } from 'testcafe';

fixture `My fixture`
    .page('http://www.example.com/');

const getElementSelectionStart = ClientFunction(id => document.getElementById(id).selectionStart);
const getElementSelectionEnd   = ClientFunction(id => document.getElementById(id).selectionEnd);

test('Select text within textarea', async t => {
    await t.selectTextAreaContent('#comment', 1, 5, 3, 10);

    expect(await getElementSelectionStart('comment')).to.equal(5);
    expect(await getElementSelectionEnd('comment')).to.equal(48);
});
```

> If the position defined by `startLine` and `startPos` is greater than the one defined
> by `endLine` and `endPos`, the action will perform a backward selection.

## Perform Selection within Editable Content

```text
t.selectEditableContent( startSelector, endSelector )
```

Parameter       | Type                                              | Description
--------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
`startSelector` | Function &#124; String &#124; Selector &#124; Snapshot &#124; Promise | Identifies a webpage element from which selection starts. The start position of selection is the first character of the element's text. See [Selecting Target Elements](index.md#selecting-target-elements).  
`endSelector`   | Function &#124; String &#124; Selector &#124; Snapshot &#124; Promise | Identifies a webpage element at which selection ends. The end position of selection is the last character of the element's text. See [Selecting Target Elements](index.md#selecting-target-elements).

This function works for HTML elements that have the `contentEditable` attribute enabled.

> Important! According to Web standards, start and end elements must have a common ancestor with the `contentEditable` attribute set to `true` -
> the [range root](https://dom.spec.whatwg.org/#concept-range-root).

The example below shows how to select several sections within a `contentEditable` area.

```js
import { expect } from 'chai';

fixture `My fixture`
    .page('http://www.example.com/');

test('Delete text within a contentEditable element', async t => {
    await t
        .selectEditableContent('#foreword', '#chapter-3')
        .pressKey('delete');

    expect(await t.select('#chapter-2')).to.be.null;
    expect(await t.select('#chapter-4')).to.not.be.null;
});
```

> If the HTML element defined by `endSelector` is located on a higher level of the page hierarchy
> than the one defined by `startSelector`, the action will perform a backward selection.
