---
layout: docs
title: Selector Options
permalink: /documentation/test-api/selecting-page-elements/selector-options.html
checked: true
---
# Selector Options

You can pass the following options to the [Selector constructor](selectors.md#creating-selectors).

* [options.boundTestRun](#optionsboundtestrun)
* [options.timeout](#optionstimeout)
* [options.visibilityCheck](#optionsvisibilitycheck)
* (***deprecated***) [options.dependencies](#optionsdependencies)
* (***deprecated***) [options.text](#optionstext)
* (***deprecated***) [options.index](#optionsindex)

You can also overwrite the options you have specified before.

* [Overwriting Options](#overwriting-options)

## options.boundTestRun

**Type**: Object

If you need to call a selector from a Node.js callback, assign the current
[test controller](../test-code-structure.md#test-controller) to the `boundTestRun` option.

For details, see [Calling Selectors from Node.js Callbacks](selectors.md#calling-selectors-from-nodejs-callbacks).

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

## options.dependencies

> Important! ***Deprecated.*** *Use [hierarchical selectors](selectors.md#find-elements-by-dom-hierarchy) instead. The `option.dependencies` will be removed in future releases.*

**Type**: Object

Contains functions, variables or objects used by the selector internally.
Properties of the `dependencies` object will be added to the selector's scope as variables.

The following sample demonstrates a selector (`gridCell`) that calls another selector (`gridRow`) internally.
The `gridRow` selector is passed to `gridCell` as a dependency.

```js
import { Selector } from 'testcafe';

const gridRow  = Selector(n => document.getElementsByClassName('grid-row')[n]);

const gridCell = Selector((m, n) => gridRow(m).children[n], {
     dependencies: { gridRow }
});
```

## options.text

> Important! ***Deprecated.*** *Use the [withText()](selectors.md#filter-multiple-dom-nodes) method to filter elements by text content or a regular expression that matches this content. The [options.text](#optionstext) option will be removed in future releases.*

**Type**: String &#124; RegExp

Text content of the node that should be selected or a regular expression that matches this content.
Use this option to filter nodes returned by the selector's [initializing](selectors.md#selector-initializers) function or CSS selector.

The `text` filter is applied whenever a function or CSS selector string that was used to initialize the selector
returns one or several nodes. If none of these nodes match the `text` filter, the selector will return `null`.

You can also use the [index](#optionsindex) option to identify a node by its index.

## options.index

> Important! ***Deprecated.*** *Use the [nth()](selectors.md#filter-multiple-dom-nodes) method to select a node by its index. The [options.index](#optionsindex) option will be removed in future releases.*

**Type**: Number

The index of the node that should be selected. Specifies the node's position among other nodes returned
by the selector's [initializing](selectors.md#selector-initializers) function or CSS selector.

Use the `index` option when a function or CSS selector string that was used to initialize the selector returns more than one DOM node.
Otherwise, this option will be ignored.

You can also use the [text](#optionstext) option to select a node by its text content.

**Default value**: `0`

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

const elementWithId = Selector(id => document.getElementById(id));

fixture `My fixture`
    .page `http://www.example.com/`;

test('My Test', async t => {
    const visibleElementWithId = elementWithId.with({
        visibilityCheck: true
    });

    const visibleButton = await visibleElementWithId('submit-button');
});
```
