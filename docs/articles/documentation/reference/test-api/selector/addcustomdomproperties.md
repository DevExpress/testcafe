---
layout: docs
title: Selector.addCustomDOMProperties Method
permalink: /documentation/reference/test-api/selector/addcustomdomproperties.html
---
# Selector.addCustomDOMProperties Method

Adds custom properties to the [selector](../../../guides/basic-guides/select-page-elements.md).

Use `addCustomDOMProperties` to retrieve DOM element properties not included in the standard selector API.

```text
Selector().addCustomDOMProperties({
    property1: fn1,
    property2: fn2,
    /* ... */
}) → Selector
```

Parameter                     | Type     | Description
----------------------------- | -------- | -----------
`property1`, `property2`, ... | String   | Property names.
`fn1`, `fn2`, ...             | Function | Functions that calculate property values. Executed on the client side in the browser.

Functions that calculate property values (`fn1`, `fn2`, ...) take the following parameters.

Parameter   | Type     | Description
----------- | -------- | -----------
`node`      | Object   | The DOM node.

**Example**

```js
import { Selector } from 'testcafe';

fixture `My fixture`
    .page `https://devexpress.github.io/testcafe/example/`;

test('Check Label HTML', async t => {
    const label = Selector('label').addCustomDOMProperties({
        innerHTML: el => el.innerHTML
    });

    await t.expect(label.innerHTML).contains('input type="checkbox" name="remote"');
});
```

If you use TypeScript, declare a Selector interface extension with your custom properties:

<!--
The `redcarpet` library ignores `ts` code and renders it as a plain text without highlighting code.
We can't use `js` here too. It's rendered wrong because of the type casting syntax. `csharp` looks
ok for TypeScript code highlighting so we'll use it until we are not fixed the problem with `redcarpet`.
-->

```csharp
interface CustomSelector extends Selector {
    innerHTML: Promise<any>;
}

interface CustomSnapshot extends NodeSnapshot {
    innerHTML: string;
}

// via selector property
const label = <CustomSelector>Selector('label').addCustomDOMProperties({
    innerHTML: el => el.innerHTML
});

await t.expect(label.innerHTML).contains('input type="checkbox" name="remote"');

// via element snapshot
const labelSnapshot = <CustomSnapshot>await label();

await t.expect(labelSnapshot.innerHTML).contains('input type="checkbox" name="remote"');
```

## Propagation

Custom properties propagate through the selector chain. You can call them for any subsequent selector:

```js
import { Selector } from 'testcafe';

fixture `My fixture`
    .page `https://devexpress.github.io/testcafe/example/`;

test('Propagate custom properties', async t => {
    const div = Selector('div').addCustomDOMProperties({
        innerHTML: el => el.innerHTML
    });

    await t
        .expect(div.innerHTML).contains('<header>')
        .expect(div.nth(2).innerHTML).contains('<fieldset>')
        .expect(div.withText('Submit').innerHTML).contains('<button');
});
```

Note that TestCafe propagates all custom properties and methods down every selector chain. Ensure that custom code does not fail during propagation:

```js
import { Selector } from 'testcafe';

fixture `My fixture`
    .page `https://devexpress.github.io/testcafe/example/`;

test('Check Label HTML', async t => {
    let fieldSet = Selector('fieldset')
        .addCustomDOMProperties({
            legend: el => el.querySelector('legend').innerText
        })
        .addCustomMethods({
            getLabel: (el, idx) => {
                return el[0].elements[idx].labels[0];
            }
        }, {
            returnDOMNodes: true
        });

    // This assertion passes.
    await t.expect(fieldSet.nth(1).legend).eql('Which features are important to you:');

    // This line throws an error.
    await t.expect(fieldSet.nth(1).getLabel(3).textContent).eql('Easy embedding into a Continuous integration system');

    // When TestCafe evaluates "getLabel(3)", it also tries to propagate
    // the "legend" property to the result. So, it queries for a
    // <legend> inside the <label> element, which returns nothing.
});
```
