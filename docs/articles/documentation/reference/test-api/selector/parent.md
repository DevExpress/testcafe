---
layout: docs
title: Selector.parent Method
permalink: /documentation/reference/test-api/selector/parent.html
---
# Selector.parent Method

Selects parent ***elements***.

## Syntax

### parent

```text
Selector().parent() → Selector
```

Finds the parents of all nodes in the matched set (first element in the set is the closest parent).

### parent(index)

```text
Selector().parent(index) → Selector
```

Finds the parents of all nodes in the matched set and filters them by index.

Argument | Type   | Description
-------- | ------ | --------------
`index`  | Number | The zero-based index (`0` is the closest parent). If `index` is negative, the index is counted from the end of the matched set.

### parent(cssSelector)

```text
Selector().parent(cssSelector) → Selector
```

Finds the parents of all nodes in the matched set and uses a CSS selector to filter them.

Argument      | Type   | Description
------------- | ------ | --------------
`cssSelector` | String | The CSS selector string used to filter child elements.

### parent(filterFn, dependencies)

```text
Selector().parent(filterFn [, dependencies]) → Selector
```

Finds the parents of all nodes in the matched set and uses a predicate to filter them.

Argument                         | Type     | Description
-------------------------------- | -------- | --------------
`filterFn`                       | Function | The predicate used to filter the elements.
`dependencies`&#160;*(optional)* | Object   | Functions, variables, or objects passed to the `filterFn` function.

See [Filtering DOM Elements by Predicates](#filtering-dom-elements-by-predicates).

## Examples

```js
// Selects all ancestors of all ul elements.
Selector('ul').parent();

// Selects all closest parents of all input elements.
Selector('input').parent(0);

// Selects all furthest ancestors of all labels.
Selector('label').parent(-1);

// Selects all divs that are ancestors of an 'a' element.
Selector('a').parent('div');
```

## Filtering DOM Elements by Predicates

{% include selectors/filter-dom-by-predicates.md %}
