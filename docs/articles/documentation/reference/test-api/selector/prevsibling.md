---
layout: docs
title: Selector.prevSibling Method
permalink: /documentation/reference/test-api/selector/prevsibling.html
---
# Selector.prevSibling Method

Selects preceding sibling ***elements***.

## Syntax

### prevSibling

```text
Selector().prevSibling() → Selector
```

Finds the preceding sibling ***elements*** of all nodes in the matched set.

### prevSibling(index)

```text
Selector().prevSibling(index) → Selector
```

Finds the preceding sibling ***elements*** of all nodes in the matched set and filters them by index.

Argument | Type   | Description
-------- | ------ | --------------
`index`  | Number | The zero-based index (`0` is the closest node). If `index` is negative, the index is counted from the end of the matched set.

### prevSibling(cssSelector)

```text
Selector().prevSibling(cssSelector) → Selector
```

Finds the preceding sibling ***elements*** of all nodes in the matched set and uses a CSS selector to filter them.

Argument      | Type   | Description
------------- | ------ | --------------
`cssSelector` | String | The CSS selector string used to filter child elements.

### prevSibling(filterFn, dependencies)

```text
Selector().prevSibling(filterFn [, dependencies]) → Selector
```

Finds the preceding sibling ***elements*** of all nodes in the matched set and uses a predicate to filter them.

Argument                         | Type     | Description
-------------------------------- | -------- | --------------
`filterFn`                       | Function | The predicate used to filter the elements.
`dependencies`&#160;*(optional)* | Object   | Functions, variables, or objects passed to the `filterFn` function.

See [Filtering DOM Elements by Predicates](#filtering-dom-elements-by-predicates).

## Examples

```js
// Selects all preceding siblings of all p elements.
Selector('p').prevSibling();

// Selects all closest preceding siblings of all figure elements.
Selector('figure').prevSibling(0);

// Selects all furthest preceding siblings of all option elements.
Selector('option').prevSibling(-1);

// Selects all p elements that are preceding siblings of a blockquote element.
Selector('blockquote').prevSibling('p');
```

## Filtering DOM Elements by Predicates

{% include selectors/filter-dom-by-predicates.md %}
