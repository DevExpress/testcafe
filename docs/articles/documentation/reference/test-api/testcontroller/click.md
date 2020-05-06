---
layout: docs
title: t.click Method
permalink: /documentation/reference/test-api/testcontroller/click.html
redirect_from:
  - /documentation/test-api/actions/click.html
---
# t.click Method

Clicks an element on a page.

```text
t.click( selector [, options] )
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | -----------------------------------------------------------------------------------------------------------------------
`selector`             | Function &#124; String &#124; Selector &#124; Snapshot &#124; Promise | Identifies the clicked page element. See [Select Target Elements](#select-target-elements).
`options`&#160;*(optional)* | Object                                            | A set of options that provide additional parameters for the action. See [Options](#options).

The following example shows how to use the `t.click` action to check a checkbox element:

```js
import { Selector } from 'testcafe';

const checkbox = Selector('#testing-on-remote-devices');

fixture `My fixture`
    .page `http://www.example.com/`;

test('Click a check box and check its state', async t => {
    await t
        .click(checkbox)
        .expect(checkbox.checked).ok();
});
```

## Select Target Elements

{% include actions/selector-parameter.md %}

## Options

{% include actions/click-options.md %}
