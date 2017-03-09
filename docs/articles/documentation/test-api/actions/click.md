---
layout: docs
title: Click
permalink: /documentation/test-api/actions/click.html
checked: true
---
# Click

Clicks a webpage element.

```text
t.click( selector [, options] )
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | -----------------------------------------------------------------------------------------------------------------------
`selector`             | Function &#124; String &#124; Selector &#124; Snapshot &#124; Promise | Identifies the webpage element being clicked. See [Selecting Target Elements](README.md#selecting-target-elements).
`options`&#160;*(optional)* | Object                                            | A set of options that provide additional parameters for the action. See [Click Action Options](action-options.md#click-action-options).

The following example shows how to use the `t.click` action to check a checkbox element.

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

The next example uses the `options` parameter to set the caret position in an input box.

```js
import { Selector } from 'testcafe';

const nameInput = Selector('#developer-name');

fixture `My fixture`
    .page `http://www.example.com/`;

test('Click Input', async t => {
    await t
        .typeText(nameInput, 'Peter Parker')
        .click(nameInput, { caretPos: 5 })
        .keyPress('backspace')
        .expect(nameInput.value).eql('Pete Parker');
});
```
