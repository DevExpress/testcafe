---
layout: docs
title: Selector.filter Method
permalink: /documentation/reference/test-api/selector/filter.html
---
# Selector.filter Method

Finds ***elements*** that match the condition.

## Syntax

### filter(cssSelector)

```text
Selector().filter(cssSelector) → Selector
```

Finds ***elements*** that match a CSS selector.

Argument      | Type   | Description
------------- | ------ | --------------
`cssSelector` | String | The CSS selector string used to filter child elements.

### filter(filterFn, dependencies)

```text
Selector().filter(filterFn [, dependencies]) → Selector
```

Finds ***elements*** that satisfy a predicate.

Argument                         | Type     | Description
-------------------------------- | -------- | --------------
`filterFn`                       | Function | The predicate used to filter the elements.
`dependencies`&#160;*(optional)* | Object   | Functions, variables, or objects passed to the `filterFn` function.

The `filterFn` predicate is executed on the client side and accepts the following parameters:

Parameter | Description
------ | -----
`node`  | The current DOM node.
`idx` | Index of the current node among other nodes in the matched set.

```js
Selector('ul').filter((node, idx) => {
    // node === a <ul> node
    // idx === index of the current <ul> node
});
```

The `dependencies` parameter allows you to pass objects to the `filterFn` client-side scope where they appear as variables.

```js
const isNodeOk = (node, idx) => { /*...*/ };

Selector('ul').filter((node, idx) => {
    return isNodeOk(node, idx);
}, { isNodeOk });
```

## Example

```js
// Selects li elements that
// have the someClass class.
Selector('li').filter('.someClass')
```
