---
layout: docs
title: Extending Selectors
permalink: /documentation/test-api/selecting-page-elements/selectors/extending-selectors.html
checked: false
---
# Extending Selectors

TestCafe allows you to extend [element state](using-selectors.md#obtain-element-state) with custom properties and methods executed on the client side.

## Custom Properties

To add custom properties, use the selector's `addCustomDOMProperties` method.

```text
Selector().addCustomDOMProperties({
    property1: fn1,
    property2: fn2,
    /* ... */
});
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
The `redcarpet` library ignores `ts` code and renders it as a plain text without code highligting.
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

## Custom Methods

To add custom methods, use the `addCustomMethods` method.

```text
Selector().addCustomMethods({
    method1: fn1,
    method2: fn2,
    /* ... */
});
```

Parameter                     | Type     | Description
----------------------------- | -------- | -----------
`method1`, `method2`, ...     | String   | Method names.
`fn1`, `fn2`, ...             | Function | Functions that contain method code. Executed on the client side in the browser.

Functions that contain method code (`fn1`, `fn2`, ...) take the following parameters.

Parameter               | Type     | Description
----------------------- | -------- | -----------
`node`                  | Object   | The DOM node.
`param1`, `param2`, ... | Any      | Method parameters.

The `addCustomMethods` function also adds the specified methods to the [element state](using-selectors.md#obtain-element-state) returned by the selector.

**Example**

```js
const myTable = Selector('.my-table').addCustomMethods({
    getCellText: (table, rowIndex, columnIndex) => {
        return table.rows[rowIndex].cells[columnIndex].innerText;
    };
});

await t.expect(myTable.getCellText(1, 1)).contains('hey!');
```

If you use TypeScript, declare a Selector interface extension with your custom methods:

<!--
The `redcarpet` library ignores `ts` code and renders it as a plain text without code highligting.
We can't use `js` here too. It's rendered wrong because of the type casting syntax. `csharp` looks
ok for TypeScript code highlighting so we'll use it until we are not fixed the problem with `redcarpet`.
-->

```csharp
interface CustomSelector extends Selector {
    getCellText(rowIndex: number, columnIndex: number): Promise<any>;
}

const myTable = <CustomSelector>Selector('#customers').addCustomMethods({
    getCellText: (table: HTMLTableElement, rowIndex: number, columnIndex: number) => {
        return table.rows[rowIndex].cells[columnIndex].innerText;
    }
});

await t.expect(myTable.getCellText(1, 1)).contains('hey!');
```
