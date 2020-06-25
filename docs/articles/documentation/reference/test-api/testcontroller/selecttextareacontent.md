---
layout: docs
title: t.selectTextAreaContent Method
permalink: /documentation/reference/test-api/testcontroller/selecttextareacontent.html
---
# t.selectTextAreaContent Method

Selects `<textarea>` content.

```text
t.selectTextAreaContent( selector [, startLine] [, startPos] [, endLine] [, endPos] [, options] )
```

Parameter  | Type                                              | Description                                                                                                                                   | Default
---------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | -------
`selector` | Function &#124; String &#124; Selector &#124; Snapshot &#124; Promise | Identifies the `<textarea>` whose text will be selected. See [Select Target Elements](#select-target-elements).
`startLine`&#160;*(optional)* | Number                                            | The line number at which selection starts. A zero-based integer.                                                           | `0`
`startPos`&#160;*(optional)*  | Number                                            | The start position of selection within the line defined by the `startLine`. A zero-based integer.                          | `0`
`endLine`&#160;*(optional)*   | Number                                            | The line number at which selection ends. A zero-based integer.                                                             | The index of the last line.
`endPos`&#160;*(optional)*    | Number                                            | The end position of selection within the line defined by `endLine`. A zero-based integer.                                  | The last position in `endLine`.
`options`&#160;*(optional)*  | Object                                            | A set of options that provide additional parameters for the action. See [Options](#options).

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

You can also select specified text with the [t.selectText](selecttext.md) method and `<textarea>` content with the [t.selectTextareaContent](selecttextareacontent.md) method.

## Select Target Elements

{% include actions/selector-parameter.md %}

## Options

{% include actions/basic-action-options.md %}
