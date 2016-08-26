---
layout: docs
title: Selector Options
permalink: /documentation/test-api/selecting-page-elements/selector-options.html
checked: true
---
# Selector Options

You can pass the following options to the [Selector constructor](selectors.md#creating-selectors) and the
[t.select](selectors.md#one-time-selection) function.

* [options.dependencies](#optionsdependencies)
* [options.boundTestRun](#optionsboundtestrun)
* [options.textFilter](#optionstextfilter)
* [options.index](#optionsindex)
* [options.timeout](#optionstimeout)
* [options.visibilityCheck](#optionsvisibilitycheck)

You can also overwrite the options you have specified before.

* [Overwriting Options](#overwriting-options)

## options.dependencies

**Type**: Object

Contains functions, variables or objects used by the selector internally.
Properties of the `dependencies` object will be added to the selector's scope as variables.

The following sample demonstrates a selector (`getGridCell`) that calls another selector (`getGridRow`) internally.
The `getGridRow` selector is passed to `getGridCell` as a dependency.

```js
import { Selector } from 'testcafe';

const getGridRow  = Selector(n => document.getElementsByClassName('grid-row')[n]);
const getGridCell = Selector((m, n) => getGridRow(m).children[n], {
     dependencies: { getGridRow }
});
```

## options.boundTestRun

**Type**: Object

If you need to call a selector from a Node.js callback, assign the current
[test controller](../test-code-structure.md#test-controller) to the `boundTestRun` option.

For details, see [Calling Selectors from Node.js Callbacks](selectors.md#calling-selectors-from-nodejs-callbacks).

## options.textFilter

**Type**: String &#124; RegExp

Text content of the node that should be selected or a regular expression that matches this content.
Use this option to filter nodes returned by the selector's [initializing](selectors.md#selector-initializers) function or CSS selector.

The `textFilter` is applied whenever a function or CSS selector string that was used to initialize the selector
returns one or several nodes. If none of these nodes match the `textFilter`, the selector will return `null`.

You can also use the [index](#optionsindex) option to identify a node by its index.

For details, see [Initializers that Return Multiple Nodes](selectors.md#initializers-that-return-multiple-nodes).

## options.index

**Type**: Number

The index of the node that should be selected. Specifies the node's position among other nodes returned
by the selector's [initializing](selectors.md#selector-initializers) function or CSS selector.

Use the `index` option when a function or CSS selector string that was used to initialize the selector returns more than one DOM node.
Otherwise, this option will be ignored.

You can also use the [textFilter](#optionstextfilter) option to select a node by its text content.

For details, see [Initializers that Return Multiple Nodes](selectors.md#initializers-that-return-multiple-nodes).

**Default value**: `0`

## options.timeout

**Type**: Number

The amount of time, in milliseconds, allowed for an element returned by the selector to appear in the DOM before the test fails.

If the [visibilityCheck](#optionsvisibilitycheck) option is enabled, the element then must become visible within the `timeout`.

**Default value**: timeout specified by using the [runner.run](../../using-testcafe/programming-interface/runner.md#run) API method
or the [selector-timeout](../../using-testcafe/command-line-interface.md#--selector-timeout-ms) command line option.

## options.visibilityCheck

**Type**: Boolean

`true` to additionally require the returned element to become visible within [options.timeout](#optionstimeout).

**Default value**: `false`

## Overwriting Options

You can overwrite selector options by using the selector's `with` function.

```text
selector.with( options ) → Selector
```

`with` returns a new selector with a different set of options that includes options
from the original selector and new `options` that overwrite the original ones.

The sample below shows how to overwrite the selector options so that it waits for the selected element to become visible.

```js
import { Selector } from 'testcafe';

const getElementById = Selector(id => document.getElementById(id));

fixture `My fixture`
    .page('http://www.example.com/');

test('My Test', async t => {
    const getVisibleElementById = getElementById.with({
        visibilityCheck: true
    });
    const visibleButton = await getVisibleElementById('submit-button');
});
```
