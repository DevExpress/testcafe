---
layout: docs
title: Selector.nextSibling Method
permalink: /documentation/reference/test-api/selector/nextsibling.html
---
# Selector.nextSibling Method

Selects succeeding sibling ***elements***.

## Syntax

### nextSibling

```text
Selector().nextSibling() → Selector
```

Finds the succeeding sibling ***elements*** of all nodes in the matched set.

### nextSibling(index)

```text
Selector().nextSibling(index) → Selector
```

Finds the succeeding sibling ***elements*** of all nodes in the matched set and filters them by index.

Argument | Type   | Description
-------- | ------ | --------------
`index`  | Number | The zero-based index. Elements are indexed beginning from the closest sibling. If `index` is negative, the index is counted from the end of the matched set.

### nextSibling(cssSelector)

```text
Selector().nextSibling(cssSelector) → Selector
```

Finds the succeeding sibling ***elements*** of all nodes in the matched set and uses a CSS selector to filter them.

Argument      | Type   | Description
------------- | ------ | --------------
`cssSelector` | String | The CSS selector string used to filter child elements.

### nextSibling(filterFn, dependencies)

```text
Selector().nextSibling(filterFn, dependencies) → Selector
```

Finds the succeeding sibling ***elements*** of all nodes in the matched set and uses a predicate to filter them.

Argument                         | Type     | Description
-------------------------------- | -------- | --------------
`filterFn`                       | Function | The predicate used to filter the elements.
`dependencies`&#160;*(optional)* | Object   | Functions, variables, or objects passed to the `filterFn` function.

See [Filtering DOM Elements by Predicates](#filtering-dom-elements-by-predicates).

## Examples

```js
// Selects all succeeding siblings of all 'a' elements.
Selector('a').nextSibling();

// Selects all closest succeeding siblings of all div elements.
Selector('div').nextSibling(0);

// Selects all furthest succeeding siblings of all pre elements.
Selector('pre').nextSibling(-1);

// Selects all p elements that are succeeding siblings of an hr element.
Selector('hr').nextSibling('p');
```

## Filtering DOM Elements by Predicates

{% include selectors/filter-dom-by-predicates.md %}