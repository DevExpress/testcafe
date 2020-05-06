---
layout: docs
title: Selector.child Method
permalink: /documentation/reference/test-api/selector/child.html
---
# Selector.child Method

Finds child ***elements*** for nodes in the matched set.

> Important! For information about how to access child ***nodes***, see [Access Child Nodes in the DOM Hierarchy](../../../guides/basic-guides/select-page-elements.md#access-child-nodes-in-the-dom-hierarchy).

## Syntax

### child

```text
Selector().child() → Selector
```

Finds the child ***elements*** of all nodes in the matched set.

### child(index)

```text
Selector().child(index) → Selector
```

Finds the child ***elements*** of all nodes in the matched set and filters them by index.

Argument | Type   | Description
-------- | ------ | --------------
`index`  | Number | The zero-based index. If `index` is negative, the index is counted from the end of the matched set.

### child(cssSelector)

```text
Selector().child(cssSelector) → Selector
```

Finds the child ***elements*** of all nodes in the matched set and filters them with a CSS selector.

Argument      | Type   | Description
------------- | ------ | --------------
`cssSelector` | String | The CSS selector string used to filter child elements.

### child(filterFn, dependencies)

```text
Selector().child(filterFn [, dependencies]) → Selector
```

Finds the child ***elements*** of all nodes in the matched set and uses a predicate to filter them.

Argument                         | Type     | Description
-------------------------------- | -------- | --------------
`filterFn`                       | Function | The predicate used to filter the elements.
`dependencies`&#160;*(optional)* | Object   | Functions, variables, or objects passed to the `filterFn` function.

See [Filtering DOM Elements by Predicates](#filtering-dom-elements-by-predicates).

## Examples

```js
// Selects all children of all ul elements.
Selector('ul').child();

// Selects all closest children of all div elements.
Selector('div').child(0);

// Selects all furthest children of all table elements.
Selector('table').child(-1);

// Selects all ul elements that are children of a nav element.
Selector('nav').child('ul');
```

## Filtering DOM Elements by Predicates

{% include selectors/filter-dom-by-predicates.md %}