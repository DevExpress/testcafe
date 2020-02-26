Functions that search for elements through the DOM tree allow you to filter the matched set by a `filterFn` predicate.

The `filterFn` predicate is executed on the client side. It takes the following parameters.

Parameter | Description
------ | -----
`node`  | The current matching node.
`idx` |  A zero-based index of `node` among other matching nodes.
`originNode` | A node from the left-hand selector's matched set whose parents/siblings/children are being iterated.

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