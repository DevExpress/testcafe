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

```js
// Selects the third ul element.
Selector('ul').nth(2);

// Selects the last div element.
Selector('div').nth(-1);
```

### withText

Method | Type | Description
------ | ----- | -----
`withText(text)` | Selector | Creates a selector that filters a matching set by the specified text. Selects elements that *contain* this text. To filter elements by *strict match*, use the `withExactText` method. The `text` parameter is case-sensitive.
`withText(re)` | Selector | Creates a selector that filters a matching set using the specified regular expression.

```js
// Selects label elements that contain 'foo'.
// Matches 'foo', 'foobar'. Does not match 'bar', 'Foo'.
Selector('label').withText('foo');

// Selects div elements whose text matches
// the /a[b-e]/ regular expression.
// Matches 'ab', 'ac'. Does not match 'bb', 'aa'.
Selector('div').withText(/a[b-e]/);
```

Note that when `withText` filters the matching set, it leaves not only the element that immediately contains the specified text but also its ancestors.

Assume the following markup.

```html
<div class="container">
    <div class="child">some text</div>
</div>
```

In this instance, a selector that targets `div` elements with the `'some text'` text will match both elements (first, the parent and then, the child).

```js
// This selector matches the parent div (.container)
// and then the child div (.child)
Selector('div').withText('some text');
```

### withExactText

Method | Type | Description
------ | ----- | -----
`withExactText(text)` | Selector | Creates a selector that filters a matching set by the specified text. Selects elements whose text content *strictly matches* this text. To search for elements that *contain* a specific text, use the `withText` method. The `text` parameter is case-sensitive.

```js
// Selects elements of the 'container' class
// whose text exactly matches 'foo'.
// Does not match 'bar', 'foobar', 'Foo'.
Selector('.container').withExactText('foo');
```

Note that when `withExactText` filters the matching set, it leaves not only the element that immediately contains the specified text but also its ancestors (if they do not contain any other text). See an example for [withText](#withtext).

### withAttribute

Method                              | Return Type | Description
----------------------------------- | -------- | -----------
`withAttribute(attrName [, attrValue])` | Selector | Finds elements that contain the specified attribute and, optionally, attribute value.

This method takes the following parameters.

Parameter                     | Type                 | Description
----------------------------- | -------------------- | -------
`attrName`                    | String &#124; RegExp | The attribute name. This parameter is case-sensitive.
`attrValue`&#160;*(optional)* | String &#124; RegExp | The attribute value. This parameter is case-sensitive. You can omit it to select elements that have the `attrName` attribute regardless of the value.

If `attrName` or `attrValue` is a String, `withAttribute` selects an element by strict match.

```js
// Selects div elements that have the 'myAttr' attribute.
// This attribute can have any value.
Selector('div').withAttribute('myAttr');

// Selects div elements whose 'attrName' attribute
// is set to 'foo'. Does not match
// the 'otherAttr' attribute, or the 'attrName' attribute
// with the 'foobar' value.
Selector('div').withAttribute('attrName', 'foo');

// Selects ul elements that have an attribute whose
// name matches the /[123]z/ regular expression.
// This attribute must have a value that matches
// the /a[0-9]/ regular expression.
// Matches the '1z' and '3z' attributes with the
// 'a0' and 'a7' values.
// Does not match the '4z' or '1b' attribute,
// as well as any attribute with the 'b0' or 'ab' value.
Selector('ul').withAttribute(/[123]z/, /a[0-9]/);
```

### filterVisible

Method                              | Type     | Description
----------------------------------- | -------- | -----------
`filterVisible()` | Selector | Creates a selector that filters a matching set leaving only visible elements. These are elements that *do not* have `display: none` or `visibility: hidden` CSS properties and have non-zero width and height.

```js
// Selects all visible div elements.
Selector('div').filterVisible();
```

### filterHidden

Method                              | Type     | Description
----------------------------------- | -------- | -----------
`filterHidden()` | Selector | Creates a selector that filters a matching set leaving only hidden elements. These are elements that have a `display: none` or `visibility: hidden` CSS property or zero width or height.

```js
// Selects all hidden label elements.
Selector('label').filterVisible();
```

### filter

Method | Return Type | Description
------ | ----- | -----
`filter(cssSelector)` | Selector | Finds elements that match the `cssSelector`.
`filter(filterFn, dependencies)` | Selector | Finds elements that satisfy the `filterFn` predicate. Use an optional `dependencies` parameter to pass functions, variables or objects to the `filterFn` function.

```js
// Selects li elements that
// have the someClass class.
Selector('li').filter('.someClass')
```

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
    const secondCheckBox = Selector('input')
        .withAttribute('type', 'checkbox')
        .nth(1);

    const checkedInputs = Selector('input')
        .withAttribute('type', 'checkbox')
        .filter(node => node.checked);

    const windowsLabel = Selector('label')
        .withText('Windows');

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

```js
// Selects input elements that are descendants
// of div elements with the someClass class.
Selector('div.someClass').find('input');
```

### parent

Method | Description
------ | -----
`parent()` | Finds all parents of all nodes in the matching set (first element in the set will be the closest parent).
`parent(index)` | Finds all parents of all nodes in the matching set and filters them by `index` (0 is the closest). If `index` is negative, the index is counted from the end of the matching set.
`parent(cssSelector)` | Finds all parents of all nodes in the matching set and filters them by `cssSelector`.
`parent(filterFn, dependencies)` | Finds all parents of all nodes in the matching set and filters them by the `filterFn` predicate. Use an optional `dependencies` parameter to pass functions, variables or objects to the `filterFn` function. See [Filtering DOM Elements by Predicates](#filtering-dom-elements-by-predicates).

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

### child

Method | Description
------ | -----
`child()` | Finds all child elements (not [nodes](https://developer.mozilla.org/en-US/docs/Web/API/Node)) of all nodes in the matching set.
`child(index)` | Finds all child elements (not nodes) of all nodes in the matching set and filters them by `index`. The `index` parameter is zero-based. If `index` is negative, the index is counted from the end of the matching set.
`child(cssSelector)` | Finds all child elements (not nodes) of all nodes in the matching set and filters them by `cssSelector`.
`child(filterFn, dependencies)` | Finds all child elements (not nodes) of all nodes in the matching set and filters them by the `filterFn` predicate. Use an optional `dependencies` parameter to pass functions, variables or objects to the `filterFn` function. See [Filtering DOM Elements by Predicates](#filtering-dom-elements-by-predicates).

> Important! To learn how to access child nodes, see [Accessing Child Nodes in the DOM Hierarchy](../../obtaining-data-from-the-client/examples-of-using-client-functions.md#accessing-child-nodes-in-the-dom-hierarchy).

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

### sibling

Method | Description
------ | -----
`sibling()` | Finds all sibling  elements (not nodes) of all nodes in the matching set.
`sibling(index)` | Finds all sibling  elements (not nodes) of all nodes in the matching set and filters them by `index`. Elements are indexed as they appear in their parents' `childNodes` collections. The `index` parameter is zero-based. If `index` is negative, the index is counted from the end of the matching set.
`sibling(cssSelector)` | Finds all sibling elements (not nodes) of all nodes in the matching set and filters them by `cssSelector`.
`sibling(filterFn, dependencies)` |  Finds all sibling elements (not nodes) of all nodes in the matching set and filters them by the `filterFn` predicate. Use an optional `dependencies` parameter to pass functions, variables or objects to the `filterFn` function. See [Filtering DOM Elements by Predicates](#filtering-dom-elements-by-predicates).

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

### nextSibling

Method | Description
------ | -----
`nextSibling()` | Finds all succeeding sibling elements (not nodes) of all nodes in the matching set.
`nextSibling(index)` | Finds all succeeding sibling elements (not nodes) of all nodes in the matching set and filters them by `index`. Elements are indexed beginning from the closest sibling. The `index` parameter is zero-based. If `index` is negative, the index is counted from the end of the matching set.
`nextSibling(cssSelector)` | Finds all succeeding sibling elements (not nodes) of all nodes in the matching set and filters them by `cssSelector`.
`nextSibling(filterFn, dependencies)` |  Finds all succeeding sibling elements (not nodes) of all nodes in the matching set and filters them by the `filterFn` predicate. Use an optional `dependencies` parameter to pass functions, variables or objects to the `filterFn` function. See [Filtering DOM Elements by Predicates](#filtering-dom-elements-by-predicates).

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

### prevSibling

Method | Description
------ | -----
`prevSibling()` | Finds all preceding sibling elements (not nodes) of all nodes in the matching set.
`prevSibling(index)` | Finds all preceding sibling elements (not nodes) of all nodes in the matching set and filters them by `index`. Elements are indexed beginning from the closest sibling. The `index` parameter is zero-based. If `index` is negative, the index is counted from the end of the matching set.
`prevSibling(cssSelector)` | Finds all preceding sibling elements (not nodes) of all nodes in the matching set and filters them by `cssSelector`.
`prevSibling(filterFn, dependencies)` |  Finds all preceding sibling elements (not nodes) of all nodes in the matching set and filters them by the `filterFn` predicate. Use an optional `dependencies` parameter to pass functions, variables or objects to the `filterFn` function. See [Filtering DOM Elements by Predicates](#filtering-dom-elements-by-predicates).

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