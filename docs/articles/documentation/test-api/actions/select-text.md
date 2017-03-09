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
t.selectText( selector [, startPos] [, endPos] [, options] )
```

Parameter               | Type                                              | Description                                                                                                                                          | Default
----------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------
`selector`              | Function &#124; String &#124; Selector &#124; Snapshot &#124; Promise | Identifies the webpage element whose text will be selected. See [Selecting Target Elements](README.md#selecting-target-elements).
`startPos`&#160;*(optional)* | Number                                            | The start position of the selection. A zero-based integer.                                                                              | `0`
`endPos`&#160;*(optional)*   | Number                                            | The end position of the selection. A zero-based integer.                                                                                | Length of the visible text content.
`options`&#160;*(optional)*  | Object                                            | A set of options that provide additional parameters for the action. See [Basic Action Options](action-options.md#basic-action-options).

> You can use `t.selectText` for `<textarea>` and `contentEditable` elements as well. However, the [t.selectTextAreaContent](#select-textarea-content)
> and [t.selectEditableContent](#perform-selection-within-editable-content) actions allow you to specify the selection range
> in a way that is more relevant for these elements.

The following example demonstrates text selection in an input element.

```js
import { ClientFunction, Selector } from 'testcafe';

fixture `My fixture`
    .page `http://devexpress.github.io/testcafe/example/`;

const developerNameInput = Selector('#developer-name');

const getElementSelectionStart = ClientFunction(selector => selector().selectionStart);
const getElementSelectionEnd   = ClientFunction(selector => selector().selectionEnd);

test('Select text within input', async t => {
    await t
        .typeText(developerNameInput, 'Test Cafe', { caretPos: 0 })
        .selectText(developerNameInput, 7, 1);

    await t
        .expect(await getElementSelectionStart(developerNameInput)).eql(1)
        .expect(await getElementSelectionEnd(developerNameInput)).eql(7);
});
```

> If the `startPos` value is greater than the `endPos` value, the action will perform a backward selection.

## Select \<textarea\> Content

```text
t.selectTextAreaContent( selector [, startLine] [, startPos] [, endLine] [, endPos] [, options] )
```

Parameter  | Type                                              | Description                                                                                                                                   | Default
---------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | -------
`selector` | Function &#124; String &#124; Selector &#124; Snapshot &#124; Promise | Identifies the `<textarea>` whose text will be selected. See [Selecting Target Elements](README.md#selecting-target-elements).
`startLine`&#160;*(optional)* | Number                                            | The line number at which selection starts. A zero-based integer.                                                           | `0`
`startPos`&#160;*(optional)*  | Number                                            | The start position of selection within the line defined by the `startLine`. A zero-based integer.                          | `0`
`endLine`&#160;*(optional)*   | Number                                            | The line number at which selection ends. A zero-based integer.                                                             | The index of the last line.
`endPos`&#160;*(optional)*    | Number                                            | The end position of selection within the line defined by `endLine`. A zero-based integer.                                  | The last position in `endLine`.
`options`&#160;*(optional)*  | Object                                            | A set of options that provide additional parameters for the action. See [Basic Action Options](action-options.md#basic-action-options).

The following example shows how to select text within a `<textarea>` element.

```js
import { ClientFunction, Selector } from 'testcafe';

fixture `My fixture`
    .page `http://devexpress.github.io/testcafe/example/`;

const commentTextArea = Selector('#comments');

const getElementSelectionStart = ClientFunction(selector => selector().selectionStart);
const getElementSelectionEnd   = ClientFunction(selector => selector().selectionEnd);

test('Select text within textarea', async t => {
    await t
        .click('#tried-test-cafe')
        .typeText(commentTextArea, [
            'Lorem ipsum dolor sit amet',
            'consectetur adipiscing elit',
            'sed do eiusmod tempor'
        ].join(',\n'))
        .selectTextAreaContent(commentTextArea, 0, 5, 2, 10);

    await t
        .expect(await getElementSelectionStart(commentTextArea)).eql(5)
        .expect(await getElementSelectionEnd(commentTextArea)).eql(67);
});
```

> If the position defined by `startLine` and `startPos` is greater than the one defined
> by `endLine` and `endPos`, the action will perform a backward selection.

## Perform Selection within Editable Content

```text
t.selectEditableContent( startSelector, endSelector [, options] )
```

Parameter       | Type                                              | Description
--------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
`startSelector` | Function &#124; String &#124; Selector &#124; Snapshot &#124; Promise | Identifies a webpage element from which selection starts. The start position of selection is the first character of the element's text. See [Selecting Target Elements](README.md#selecting-target-elements).
`endSelector`   | Function &#124; String &#124; Selector &#124; Snapshot &#124; Promise | Identifies a webpage element at which selection ends. The end position of selection is the last character of the element's text. See [Selecting Target Elements](README.md#selecting-target-elements).
`options`&#160;*(optional)*  | Object                                            | A set of options that provide additional parameters for the action. See [Basic Action Options](action-options.md#basic-action-options).

This function works for HTML elements that have the `contentEditable` attribute enabled.

> Important! According to Web standards, start and end elements must have a common ancestor with the `contentEditable` attribute set to `true` -
> the [range root](https://dom.spec.whatwg.org/#concept-range-root).

The example below shows how to select several sections within a `contentEditable` area.

```js
import { Selector } from 'testcafe';

fixture `My fixture`
    .page `http://www.example.com/`;

test('Delete text within a contentEditable element', async t => {
    await t
        .selectEditableContent('#foreword', '#chapter-3')
        .pressKey('delete')
        .expect(Selector('#chapter-2').exists).notOk()
        .expect(Selector('#chapter-4').exists).ok();
});
```

> If the HTML element defined by `endSelector` is located on a higher level of the page hierarchy
> than the one defined by `startSelector`, the action will perform a backward selection.
