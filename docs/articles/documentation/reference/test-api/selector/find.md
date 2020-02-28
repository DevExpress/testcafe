---
layout: docs
title: Selector.find Method
permalink: /documentation/reference/test-api/selector/find.html
---
# Selector.find Method

Finds a descendant ***node*** that matches the specified CSS selector or predicate.

## Syntax

### find(cssSelector)

```text
Selector().find(cssSelector) → Selector
```

Finds the descendant ***nodes*** of all nodes in the matched set and uses a CSS selector to filter them.

Argument      | Type   | Description
------------- | ------ | --------------
`cssSelector` | String | The CSS selector string used to filter child elements.

### find(filterFn, dependencies)

```text
Selector().find(filterFn, dependencies) → Selector
```

Finds the descendant ***nodes*** of all nodes in the matched set and uses a predicate to filter them.

Argument                         | Type     | Description
-------------------------------- | -------- | --------------
`filterFn`                       | Function | The predicate used to filter the elements.
`dependencies`&#160;*(optional)* | Object   | Functions, variables, or objects passed to the `filterFn` function.

See [Filtering DOM Elements by Predicates](#filtering-dom-elements-by-predicates).

## Example

```js
// Selects input elements that are descendants
// of div elements with the someClass class.
Selector('div.someClass').find('input');
```

## Filtering DOM Elements by Predicates

{% include selectors/filter-dom-by-predicates.md %}