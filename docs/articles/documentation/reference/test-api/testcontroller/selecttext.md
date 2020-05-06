---
layout: docs
title: t.selectText Method
permalink: /documentation/reference/test-api/testcontroller/selecttext.html
---
# t.selectText Method

Selects text in input elements of various types.

```text
t.selectText( selector [, startPos] [, endPos] [, options] )
```

Parameter               | Type                                              | Description                                                                                                                                          | Default
----------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------
`selector`              | Function &#124; String &#124; Selector &#124; Snapshot &#124; Promise | Identifies the webpage element whose text will be selected. See [Select Target Elements](#select-target-elements).
`startPos`&#160;*(optional)* | Number                                            | The start position of the selection. A zero-based integer.                                                                              | `0`
`endPos`&#160;*(optional)*   | Number                                            | The end position of the selection. A zero-based integer.                                                                                | Length of the visible text content.
`options`&#160;*(optional)*  | Object                                            | A set of options that provide additional parameters for the action. See [Options](#options).

> You can use `t.selectText` for `<textarea>` and `contentEditable` elements as well. However, the [t.selectTextAreaContent](selecttextareacontent.md)
> and [t.selectEditableContent](selecteditablecontent.md) actions allow you to specify the selection range
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

You can also select `<textarea>` content with the [t.selectTextareaContent](selecttextareacontent.md) method and editable content with the [t.selectEditableContent](selecteditablecontent.md) method.

## Select Target Elements

{% include actions/selector-parameter.md %}

## Options

{% include actions/basic-action-options.md %}
