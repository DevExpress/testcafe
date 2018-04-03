---
layout: docs
title: Functional-Style Selectors
permalink: /documentation/test-api/selecting-page-elements/selectors/functional-style-selectors.html
checked: false
---
# Functional-Style Selectors

The selector API provides methods used to filter the selector matching set and search for nodes through the DOM tree.
These methods can be used in a chain for a functional-style selection mechanism.

* [Filter DOM Nodes](#filter-dom-nodes)
    * [nth](#nth)
    * [withText](#withtext)
    * [withExactText](#withexacttext)
    * [withAttribute](#withattribute)
    * [filterVisible](#filtervisible)
    * [filterHidden](#filterhidden)
    * [filter](#filter)
* [Search for Elements in the DOM Hierarchy](#search-for-elements-in-the-dom-hierarchy)
    * [find](#find)
    * [parent](#parent)
    * [child](#child)
    * [sibling](#sibling)
    * [nextSibling](#nextsibling)
    * [prevSibling](#prevsibling)
* [Examples](#examples)

## Filter DOM Nodes

If a selector returns multiple DOM nodes, you can filter them to select
a single node that will eventually be returned by the selector.
The selector provides methods to filter DOM nodes by their index, text, attributes, etc.

### nth

Method | Return Type | Description
------ | ----- | -----
`nth(index)` | Selector | Finds an element by its index in the matching set. The `index` parameter is zero-based. If `index` is negative, the index is counted from the end of the matching set.

### withText

Method | Type | Description
------ | ----- | -----
`withText(text)` | Selector | Creates a selector that filters a matching set by the specified text. Selects elements that *contain* this text. To filter elements by *strict match*, use the `withExactText` method. The `text` parameter is case-sensitive.
`withText(re)` | Selector | Creates a selector that filters a matching set using the specified regular expression.

### withExactText

Method | Type | Description
------ | ----- | -----
`withExactText(text)` | Selector | Creates a selector that filters a matching set by the specified text. Selects elements whose text content *strictly matches* this text. To search for elements that *contain* a specific text, use the `withText` method. The `text` parameter is case-sensitive.

### withAttribute

Method                              | Return Type | Description
----------------------------------- | -------- | -----------
`withAttribute(attrName [, attrValue])` | Selector | Finds elements that contain the specified attribute and, optionally, attribute value.

This method takes the following parameters.

Parameter                     | Type                 | Description
----------------------------- | -------------------- | -------
`attrName`                    | String &#124; RegExp | The attribute name.
`attrValue`&#160;*(optional)* | String &#124; RegExp | The attribute value. You can omit this parameter to select elements that have the `attrName` attribute regardless of the value.

If `attrName` or `attrValue` is a String, `withAttribute` selects an element by strict match.

#### filterVisible

Method                              | Type     | Description
----------------------------------- | -------- | -----------
`filterVisible()` | Selector | Creates a selector that filters a matching set leaving only visible elements. These are elements that *do not* have `display: none` or `visibility: hidden` CSS properties and have non-zero width and height.

#### filterHidden

Method                              | Type     | Description
----------------------------------- | -------- | -----------
`filterHidden()` | Selector | Creates a selector that filters a matching set leaving only hidden elements. These are elements that have a `display: none` or `visibility: hidden` CSS property or zero width or height.

### filter

Method | Return Type | Description
------ | ----- | -----
`filter(cssSelector)` | Selector | Finds elements that match the `cssSelector`.
`filter(filterFn, dependencies)` | Selector | Finds elements that satisfy the `filterFn` predicate. Use an optional `dependencies` parameter to pass functions, variables or objects to the `filterFn` function.

The `filterFn` predicate is executed on the client. It takes the following parameters.

Parameter | Description
------ | -----
`node`  | The current DOM node.
`idx` | Index of the current node among other nodes in the matching set.

```js
Selector('ul').filter((node, idx) => {
    // node === a <ul> node
    // idx === index of the current <ul> node
});
```

The [dependencies parameter](../../obtaining-data-from-the-client/README.md#optionsdependencies) allows
you to pass objects to the `filterFn` client-side scope where they appear as variables.

```js
const isNodeOk = (node, idx) => { /*...*/ };

Selector('ul').filter((node, idx) => {
    return isNodeOk(node, idx);
}, { isNodeOk });
```

**Example**

```js
import { Selector } from 'testcafe';

fixture `Example page`
    .page `http://devexpress.github.io/testcafe/example/`;

test('My test', async t => {
    const secondCheckBox = Selector('input[type=checkbox]').nth(1);
    const checkedInputs  = Selector('input[type=checkbox]').filter(node => node.checked);
    const windowsLabel   = Selector('label').withText('Windows');

    await t
        .click(secondCheckBox)
        .expect(checkedInputs.count).eql(1)
        .click(windowsLabel);
});
```

If all nodes are filtered out, the selector returns `null`.

## Search for Elements in the DOM Hierarchy

The selector API provides methods to find elements in a DOM hierarchy in jQuery style.

### find

Method | Description
------ | -----
`find(cssSelector)` | Finds all descendants of all nodes in the matching set and filters them by `cssSelector`.
`find(filterFn, dependencies)` | Finds all descendants of all nodes in the matching set and filters them using `filterFn` predicate. Use an optional `dependencies` parameter to pass functions, variables or objects to the `filterFn` function. See [Filtering DOM Elements by Predicates](#filtering-dom-elements-by-predicates).

### parent

Method | Description
------ | -----
`parent()` | Finds all parents of all nodes in the matching set (first element in the set will be the closest parent).
`parent(index)` | Finds all parents of all nodes in the matching set and filters them by `index` (0 is the closest). If `index` is negative, the index is counted from the end of the matching set.
`parent(cssSelector)` | Finds all parents of all nodes in the matching set and filters them by `cssSelector`.
`parent(filterFn, dependencies)` | Finds all parents of all nodes in the matching set and filters them by the `filterFn` predicate. Use an optional `dependencies` parameter to pass functions, variables or objects to the `filterFn` function. See [Filtering DOM Elements by Predicates](#filtering-dom-elements-by-predicates).

### child

Method | Description
------ | -----
`child()` | Finds all child elements (not [nodes](https://developer.mozilla.org/en-US/docs/Web/API/Node)) of all nodes in the matching set.
`child(index)` | Finds all child elements (not nodes) of all nodes in the matching set and filters them by `index`. The `index` parameter is zero-based. If `index` is negative, the index is counted from the end of the matching set.
`child(cssSelector)` | Finds all child elements (not nodes) of all nodes in the matching set and filters them by `cssSelector`.
`child(filterFn, dependencies)` | Finds all child elements (not nodes) of all nodes in the matching set and filters them by the `filterFn` predicate. Use an optional `dependencies` parameter to pass functions, variables or objects to the `filterFn` function. See [Filtering DOM Elements by Predicates](#filtering-dom-elements-by-predicates).

> Important! To know how to access child nodes, see [Accessing Child Nodes in the DOM Hierarchy](../../obtaining-data-from-the-client/examples-of-using-client-functions.md#accessing-child-nodes-in-the-dom-hierarchy).

### sibling

Method | Description
------ | -----
`sibling()` | Finds all sibling  elements (not nodes) of all nodes in the matching set.
`sibling(index)` | Finds all sibling  elements (not nodes) of all nodes in the matching set and filters them by `index`. The `index` parameter is zero-based. If `index` is negative, the index is counted from the end of the matching set.
`sibling(cssSelector)` | Finds all sibling elements (not nodes) of all nodes in the matching set and filters them by `cssSelector`.
`sibling(filterFn, dependencies)` |  Finds all sibling elements (not nodes) of all nodes in the matching set and filters them by the `filterFn` predicate. Use an optional `dependencies` parameter to pass functions, variables or objects to the `filterFn` function. See [Filtering DOM Elements by Predicates](#filtering-dom-elements-by-predicates).

### nextSibling

Method | Description
------ | -----
`nextSibling()` | Finds all succeeding sibling elements (not nodes) of all nodes in the matching set.
`nextSibling(index)` | Finds all succeeding sibling elements (not nodes) of all nodes in the matching set and filters them by `index`. The `index` parameter is zero-based. If `index` is negative, the index is counted from the end of the matching set.
`nextSibling(cssSelector)` | Finds all succeeding sibling elements (not nodes) of all nodes in the matching set and filters them by `cssSelector`.
`nextSibling(filterFn, dependencies)` |  Finds all succeeding sibling elements (not nodes) of all nodes in the matching set and filters them by the `filterFn` predicate. Use an optional `dependencies` parameter to pass functions, variables or objects to the `filterFn` function. See [Filtering DOM Elements by Predicates](#filtering-dom-elements-by-predicates).

### prevSibling

Method | Description
------ | -----
`prevSibling()` | Finds all preceding sibling elements (not nodes) of all nodes in the matching set.
`prevSibling(index)` | Finds all preceding sibling elements (not nodes) of all nodes in the matching set and filters them by `index`. The `index` parameter is zero-based. If `index` is negative, the index is counted from the end of the matching set.
`prevSibling(cssSelector)` | Finds all preceding sibling elements (not nodes) of all nodes in the matching set and filters them by `cssSelector`.
`prevSibling(filterFn, dependencies)` |  Finds all preceding sibling elements (not nodes) of all nodes in the matching set and filters them by the `filterFn` predicate. Use an optional `dependencies` parameter to pass functions, variables or objects to the `filterFn` function. See [Filtering DOM Elements by Predicates](#filtering-dom-elements-by-predicates).

### Filtering DOM Elements by Predicates

Functions that search for elements through the DOM tree allow you to filter the matching set by a `filterFn` predicate.

The `filterFn` predicate is executed on the client. It takes the following parameters.

Parameter | Description
------ | -----
`node`  | The current matching node.
`idx` |  A zero-based index of `node` among other matching nodes.
`originNode` | A node from the left-hand selector's matching set whose parents/siblings/children are being iterated.

```js
Selector('section').prevSibling((node, idx, originNode) => {
    // node === the <section>'s preceding sibling node
    // idx === index of the current <section>'s preceding sibling node
    // originNode === the <section> element
});
```

The [dependencies parameter](../../obtaining-data-from-the-client/README.md#optionsdependencies) allows
you to pass objects to the `filterFn` client-side scope where they appear as variables.

```js
const isNodeOk = (node, idx, originNode) => { /*...*/ };

Selector('ul').prevSibling((node, idx, originNode) => {
    return isNodeOk(node, idx, originNode);
}, { isNodeOk });
```

## Examples

```js
Selector('ul').find('label').parent('div.someClass')
```

Finds all `ul` elements on page. Then, in each found `ul` element finds `label` elements.
Then, for each `label` element finds a parent that matches the `div.someClass` selector.

------

Like in jQuery, if you request a [property](../dom-node-state.md#members-common-across-all-nodes) of the matching set or try to evaluate
a [snapshot](using-selectors.md#dom-node-snapshot), the selector returns values for the first element in the set.

```js
// Returns id of the first element in the set
const id = await Selector('ul').find('label').parent('div.someClass').id;

// Returns snapshot for the first element in the set
const snapshot = await Selector('ul').find('label').parent('div.someClass')();
```

However, you can obtain data for any element in the set by using `nth` filter.

```js
// Returns id of the third element in the set
const id = await Selector('ul').find('label').parent('div.someClass').nth(2).id;

// Returns snapshot for the fourth element in the set
const snapshot = await Selector('ul').find('label').parent('div.someClass').nth(4)();
```

------

Note that you can add text and index filters in the selector chain.

```js
Selector('.container').parent(1).nth(0).find('.content').withText('yo!').child('span');
```

In this example the selector:

1. finds the second parent (parent of parent) of `.container` elements;
2. picks the first element in the matching set;
3. in that element, finds elements that match the `.content` selector;
4. filters them by text `yo!`;
5. in each filtered element, searches for a child with tag name `span`.

------

The following example shows how to use functional-style selection in test code.

```js
import { Selector } from 'testcafe';

fixture `Example page`
    .page `http://devexpress.github.io/testcafe/example/`;

test('My test', async t => {
    const macOSRadioButton = Selector('.column.col-2').find('label').child(el => el.value === 'MacOS');

    await t
        .click(macOSRadioButton.parent())
        .expect(macOSRadioButton.checked).ok();
});
```