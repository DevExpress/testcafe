Functions that search for elements in the DOM tree allow you to use a `filterFn` predicate to filter the matched set.

The `filterFn` predicate is executed on the client side and accepts the following parameters:

Parameter | Description
------ | -----
`node`  | The current matching node.
`idx` |  A matching node's zero-based index.
`originNode` | A node from the left-hand selector's matched set whose parents/siblings/children are being iterated.

```js
Selector('section').prevSibling((node, idx, originNode) => {
    // node === the <section>'s preceding sibling node
    // idx === index of the current <section>'s preceding sibling node
    // originNode === the <section> element
});
```

The [dependencies parameter](/testcafe/documentation/reference/test-api/selector/constructor.html#optionsdependencies) allows
you to pass objects to the `filterFn` client-side scope where they appear as variables.

```js
const isNodeOk = (node, idx, originNode) => { /*...*/ };

Selector('ul').prevSibling((node, idx, originNode) => {
    return isNodeOk(node, idx, originNode);
}, { isNodeOk });
```
