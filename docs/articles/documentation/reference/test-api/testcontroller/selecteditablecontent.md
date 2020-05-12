---
layout: docs
title: t.selectEditableContent Method
permalink: /documentation/reference/test-api/testcontroller/selecteditablecontent.html
---
# t.selectEditableContent Method

Selects editable content on a web page.

```text
t.selectEditableContent( startSelector, endSelector [, options] )
```

Parameter       | Type                                              | Description
--------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
`startSelector` | Function &#124; String &#124; Selector &#124; Snapshot &#124; Promise | Identifies a webpage element from which selection starts. The start position of selection is the first character of the element's text. See [Select Target Elements](#select-target-elements).
`endSelector`   | Function &#124; String &#124; Selector &#124; Snapshot &#124; Promise | Identifies a webpage element at which selection ends. The end position of selection is the last character of the element's text. See [Select Target Elements](#select-target-elements).
`options`&#160;*(optional)*  | Object                                            | A set of options that provide additional parameters for the action. See [Options](#options).

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

You can also select `<textarea>` content with the [t.selectTextareaContent](selecttextareacontent.md) method and editable content with the [t.selectEditableContent](selecteditablecontent.md) method.

## Select Target Elements

{% include actions/selector-parameter.md %}

## Options

{% include actions/basic-action-options.md %}
