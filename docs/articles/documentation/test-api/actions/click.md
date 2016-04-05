---
layout: docs
title: Click
permalink: /documentation/test-api/actions/click.html
---
# Click

Clicks a webpage element.

```text
t.click( selector [, options] )
```

Parameter              | Type                                              | Description
---------------------- | ------------------------------------------------- | -----------------------------------------------------------------------------------------------------------------------
`selector`             | Function &#124; String &#124; Selector &#124; Snapshot &#124; Promise | Identifies the webpage element being clicked. See [Selecting Target Elements](index.md#selecting-target-elements).
`options` *(optional)* | Object                                            | A set of options that provide additional parameters for the action. See [Click Action Options](action-options.md#click-action-options).

The following example shows how to use the `t.click` action to check a checkbox element.

```js
import { expect } from 'chai';

fixture `My fixture`
    .page('http://www.example.com/');

test('Click a check box and check its state', async t => {
    await t.click('#testing-on-remote-devices');

    const checkBox = await t.select('#testing-on-remote-devices');

    expect(checkBox.checked).to.be.true;
});
```

The next example uses the `options` parameter to set the caret position in the edit box after it has been clicked.

```js
import { expect } from 'chai';

fixture `My fixture`
    .page('http://www.example.com/');

test('Click Input', async t => {
    await t
        .typeText('#developer-name', 'Peter Parker')
        .click('#developer-name', { caretPos: 5 })
        .keyPress('backspace');

    const input = await t.select('#developer-name');

    expect(input.value).to.equal('Pete Parker');
});
```