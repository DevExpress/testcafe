---
layout: docs
title: Selector.addCustomMethods Method
permalink: /documentation/reference/test-api/selector/addcustommethods.html
---
# Selector.addCustomMethods Method

Adds custom methods executed on the client side to the [selector](../../../guides/basic-guides/select-page-elements.md).

Use `addCustomMethods` to implement selector methods specific to the web app architecture or framework.

```text
Selector().addCustomMethods({
    method1: fn1,
    method2: fn2,
    /* ... */
}, options) → Selector
```

Parameter                     | Type     | Description
----------------------------- | -------- | -----------
`method1`, `method2`, ...     | String   | Method names.
`fn1`, `fn2`, ...             | Function | Functions that contain method code. Executed on the client side in the browser.
`options`                     | Object   | Custom method [options](#options).

Functions that contain method code (`fn1`, `fn2`, ...) take the following parameters.

Parameter               | Type                | Description
----------------------- | ------------------- | -----------
`node`                  | Object &#124; Array | The DOM node if the [returnDOMNodes](#options) option is set to `false`; an array of DOM nodes if [returnDOMNodes](#options) is set to `true`.
`param1`, `param2`, ... | Any      | Method parameters.

The `addCustomMethods` function also adds the specified methods to the [element state](../domnodestate.md) returned by the selector.

## Options

Option           | Type     | Description     | Default
---------------- | -------- | --------------  | -------
`returnDOMNodes` | Boolean  | `true` if custom methods return DOM nodes; `false` if they return serializable objects. | `false`

Enable `returnDOMNodes` to use custom method results as selectors to define [action targets](../../../guides/basic-guides/select-page-elements.md#define-action-targets) or [assertion's actual values](../../../guides/basic-guides/select-page-elements.md#define-assertion-actual-value), obtain the [element state](../../../guides/basic-guides/select-page-elements.md#obtain-element-state), etc.

The following example shows how to add both types of methods to a selector. `addCustomMethods` is called twice: the first call adds a method that returns a DOM node (`returnDOMNodes` is set to `true`), the second call defines a method that returns a string.

**Example**

```js
import { Selector } from 'testcafe';

fixture `My fixture`
    .page `https://js.devexpress.com/`;

test('My test', async t => {
    const myTable = Selector('.dx-datagrid-table')
        .nth(1)
        .addCustomMethods({
            getExpandButtonCell: (elements, rowIndex) => {
                return elements[0].querySelectorAll('.dx-group-row')[rowIndex].cells[0];
            }
            // ...
            // Other methods that return DOM nodes.
        }, {
            returnDOMNodes: true
        })
        .addCustomMethods({
            getCellText: (table, rowIndex, columnIndex) => {
                return table.rows[rowIndex].cells[columnIndex].innerText;
            }
            // ...
            // Other methods that return serializable objects.
        });

    await t
        .expect(myTable.getCellText(3, 1)).contains('Europe')
        .click(myTable.getExpandButtonCell(0))
        .expect(myTable.getCellText(1, 1)).contains('North America');
});
```

If you use TypeScript, declare a Selector interface extension with your custom methods:

<!--
The `redcarpet` library ignores `ts` code and renders it as a plain text without code highligting.
We can't use `js` here too. It's rendered wrong because of the type casting syntax. `csharp` looks
ok for TypeScript code highlighting so we'll use it until we are not fixed the problem with `redcarpet`.
-->

```csharp
import { Selector } from 'testcafe';

interface CustomSelector extends Selector {
    getCellText(rowIndex: number, columnIndex: number): Promise<any>;
    getExpandButtonCell(rowIndex: number): Promise<any>;
}

fixture `My fixture`
    .page `https://js.devexpress.com/`;

test('My test', async t => {
    const myTable = <CustomSelector>Selector('#customers').addCustomMethods({
        getExpandButtonCell: (elements: HTMLCollection, rowIndex: number) => {
            return elements[0].querySelectorAll('.dx-group-row')[rowIndex].cells[0];
        }
        // ...
        // Other methods that return DOM nodes.
    }, {
        returnDOMNodes: true
    })
    .addCustomMethods({
        getCellText: (table: HTMLTableElement, rowIndex: number, columnIndex: number) => {
            return table.rows[rowIndex].cells[columnIndex].innerText;
        }
        // ...
        // Other methods that return serializable objects.
    });

    await t
        .expect(myTable.getCellText(3, 1)).contains('Europe')
        .click(myTable.getExpandButtonCell(0))
        .expect(myTable.getCellText(1, 1)).contains('North America');
});
```

## Propagation

Custom methods propagate through the selector chain. You can call them for any subsequent selector:

```js
import { Selector } from 'testcafe';

fixture `My fixture`
    .page `https://devexpress.github.io/testcafe/example/`;

test('Propagate custom properties', async t => {
    const fieldSet = Selector('fieldset').addCustomMethods({
        getInput: (el, idx) => {
            return el[0].querySelectorAll('input')[idx];
        }
    }, {
        returnDOMNodes: true
    });

    await t
        .typeText(fieldSet.getInput(0), 'Peter Parker')
        .click(fieldSet.withText('Operating System').getInput(2))
        .click(fieldSet.withAttribute('id', 'tried-section').getInput(0));
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
