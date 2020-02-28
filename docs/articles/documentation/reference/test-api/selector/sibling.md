---
layout: docs
title: Selector.sibling Method
permalink: /documentation/reference/test-api/selector/sibling.html
---
# Selector.sibling Method

Selects sibling ***elements***.

## Syntax

### sibling

```text
Selector().sibling() → Selector
```

Finds the sibling ***elements*** of all nodes in the matched set.

### sibling(index)

```text
Selector().sibling(index) → Selector
```

Finds the sibling ***elements*** of all nodes in the matched set and filters them by index.

Argument | Type   | Description
-------- | ------ | --------------
`index`  | Number | The zero-based index. Elements are indexed as they appear in their parents' `childNodes` collections. If `index` is negative, the index is counted from the end of the matched set.

### sibling(cssSelector)

```text
Selector().sibling(cssSelector) → Selector
```

Finds the sibling ***elements*** of all nodes in the matched set and uses a CSS selector to filter them.

Argument      | Type   | Description
------------- | ------ | --------------
`cssSelector` | String | The CSS selector string used to filter child elements.

### sibling(filterFn, dependencies)

```text
Selector().sibling(filterFn [, dependencies]) → Selector
```

Finds the sibling ***elements*** of all nodes in the matched set uses a predicate to filter them.

Argument                         | Type     | Description
-------------------------------- | -------- | --------------
`filterFn`                       | Function | The predicate used to filter the elements.
`dependencies`&#160;*(optional)* | Object   | Functions, variables, or objects passed to the `filterFn` function.

See [Filtering DOM Elements by Predicates](#filtering-dom-elements-by-predicates).

## Examples

```js
// Selects all siblings of all td elements.
Selector('td').sibling();

// Selects all li elements' siblings
// that go first in their parent's child lists.
Selector('li').sibling(0);

// Selects all ul elements' siblings
// that go last in their parent's child lists.
Selector('ul').sibling(-1);

// Selects all p elements that are siblings of an img element.
Selector('img').sibling('p');
```

## Filtering DOM Elements by Predicates

{% include selectors/filter-dom-by-predicates.md %}
