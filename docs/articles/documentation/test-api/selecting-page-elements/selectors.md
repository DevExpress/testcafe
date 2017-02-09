---
layout: docs
title: Selectors
permalink: /documentation/test-api/selecting-page-elements/selectors.html
checked: false
---
# Selectors

A selector is a function that identifies a webpage element in the test.
The selector API provides methods and properties to select elements on the page and get their state.
You can use selectors to [inspect elements state on the page](#obtain-element-state), define [action targets](#define-action-targets) and
[assertion actual values](#define-assertion-actual-value).

> Important! Do not modify the tested webpage within selectors.
> To interact with the page, use [test actions](../actions/index.md).

This topic contains the following sections.

* [Creating Selectors](#creating-selectors)
* [Selector Initializers](#selector-initializers)
* [Functional-Style Selectors](#functional-style-selectors)
  * [Filter DOM Nodes](#filter-dom-nodes)
      * [nth](#nth)
      * [withText](#withtext)
      * [filter](#filter)
  * [Search for Elements in the DOM Hierarchy](#search-for-elements-in-the-dom-hierarchy)
      * [find](#find)
      * [parent](#parent)
      * [child](#child)
      * [sibling](#sibling)
      * [nextSibling](#nextsibling)
      * [prevSibling](#prevsibling)
  * [Examples](#examples)
* [Using Selectors](#using-selectors)
  * [Check if an Element Exists](#check-if-an-element-exists)
  * [Obtain Element State](#obtain-element-state)
    * [DOM Node Snapshot](#dom-node-snapshot)
  * [Define Action Targets](#define-action-targets)
  * [Define Assertion Actual Value](#define-assertion-actual-value)
  * [Selector Timeout](#selector-timeout)
* [Adding Custom Properties to Element State](#adding-custom-properties-to-element-state)
* [One-Time Selection](#one-time-selection)
* [Calling Selectors from Node.js Callbacks](#calling-selectors-from-nodejs-callbacks)
* [Limitations](#limitations)

## Creating Selectors

To create a selector, use the `Selector` constructor.

```text
Selector( init [, options] )
```

Parameter              | Type     | Description
---------------------- | -------- | -------------------------------------------------------------------------------
`init`                 | Function &#124; String &#124; Selector &#124; Snapshot &#124; Promise | Identifies a DOM node to be selected. See [Selector Initializers](#selector-initializers).
`options`&#160;*(optional)* | Object   | See [Options](selector-options.md).

The following example creates a selector from a css string for an element with 'username' id.

```js
import { Selector } from 'testcafe';

const usernameInput = Selector('#username');
```

## Selector Initializers

You can initialize a selector with any of these objects.

* A CSS selector string that matches one or several nodes.

    ```js
    import { Selector } from 'testcafe';

    // A selector is created from a CSS selector string.
    const submitButton = Selector('#submit-button');
    ```

* A regular function. Executed on the client side. Must return a DOM node, array of DOM nodes,
  NodeList, HTMLCollection, `null` or `undefined`. Cannot use outer-scope variables from test code.
  This is convenient when you need to use some client-side logic to get an element.

    ```js
    import { Selector } from 'testcafe';

    // A selector is created from a regular function.
    // This selector will take an element by id that is saved in the localStorage
    // a DOM element that has this ID.
    const element = Selector(() => {
        const storedElementId = window.localStorage.storedElementId;

        return document.querySelector(storedElementId);
    });
    ```

* A selector.

    ```js
    import { Selector } from 'testcafe';

    // This selector is created from a function that returns all elements of a specified class.
    const submitButton = Selector('#submit-button');

    // This selector is created based on the previous selector and inherits
    // its initializer, but overwrites the `visibilityCheck` parameter.
    Selector(submitButton, { visibilityCheck: false });
    ```

* A [DOM Node Snapshot](#dom-node-snapshot) returned by selector execution.

    ```js
    import { Selector } from 'testcafe';

    fixture `My fixture`
        .page `http://www.example.com/`;

    test('My Test', async t => {
        const topMenuSnapshot = await Selector('#top-menu')();

        // This selector is created from a DOM Node state object returned
        // by a different selector. The new selector will use the same initializer
        // as 'elementWithId' and will always be executed with the same parameter
        // values that were used to obtain 'topMenuSnapshot'. You can still
        // overwrite the selector options.
        const visibleTopMenu = Selector(topMenuSnapshot, {
            visibilityCheck: true
        });
    });
    ```

* A promise returned by a selector.

    ```js
    import { Selector } from 'testcafe';

    const elementWithIdOrClassName = Selector(value => {
        return document.getElementById(value) || document.getElementsByClassName(value);
    });

    fixture `My fixture`
        .page `http://www.example.com/`;

    test('My Test', async t => {
        // This selector is created from a promise returned by a call to a
        // different selector. The new selector will be initialized with the
        // same function as the old one and with hard-coded parameter values
        // as in the previous example.
        const submitButton = Selector(elementWithIdOrClassName('main-element'));
    });
    ```

## Functional-Style Selectors

The selector API provides methods that can be combined together, thus
providing you with a flexible functional-style selector mechanism.

### Filter DOM Nodes

If selector returns multiple DOM nodes, you must filter them to select
a single node that will eventually be returned by the selector.
The selector provides methods to filter DOM nodes by their index or text.

#### nth

Method | Type | Description
------ | ----- | -----
`nth(index)` | Selector | Creates a selector that returns an element by its index in the matching set. If `index` is negative, the index is counted from the end of the matching set.

#### withText

Method | Type | Description
------ | ----- | -----
`withText(text)` | Selector | Creates a selector that filters a matching set by the specified text.
`withText(re)` | Selector | Creates a selector that filters a matching set using the specified regular expression.

#### filter

Method | Type | Description
------ | ----- | -----
`filter(cssSelector)` | Selector | Creates a selector that filters a matching set by `cssSelector`.
`filter(filterFn, dependencies)` | Selector | Creates a selector that filters a matching set by the `filterFn` predicate. Use an optional `dependencies` parameter to pass functions, variables or objects used in the `filterFn` function internally.

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

The [dependencies parameter](../obtaining-data-from-the-client.md#optionsdependencies) allows
you to pass objects to the `filterFn` client-side scope where they appear as variables.

```js
const isNodeOk = ClientFunction((node, idx) => { /*...*/ });

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
    const secondCheckBox = Selector('input[type=checkbox]').nth(1);
    const checkedInputs  = Selector('input[type=checkbox]').filter(node => node.checked);
    const windowsLabel   = Selector('label').withText('Windows');

    await t
        .click(secondCheckBox)
        .expect(checkedInputs.count).eql(1)
        .click(windowsLabel);
});
```

If all nodes are filtered out, the selector returns `null`.

### Search for Elements in the DOM Hierarchy

The selector API provides methods to find elements within a DOM hierarchy in jQuery style.

#### find

Method | Description
------ | -----
`find(cssSelector)` | Finds all descendants of all nodes in the matching set and filters them by `cssSelector`.
`find(filterFn, dependencies)` | Finds all descendants of all nodes in the matching set and filters them using `filterFn` predicate. Use an optional `dependencies` parameter to pass functions, variables or objects used in the `filterFn` function internally.

The `filterFn` predicate is executed on the client. It takes the following parameters.

Parameter | Description
------ | -----
`node`  | The current descendant node.
`idx` | Index of `node` among other descendant nodes.
`originNode` | A node from the left-hand selector's matching set whose descendants are being iterated.

```js
Selector('ul').find((node, idx, originNode) => {
    // node === the <ul>'s descendant node
    // idx === index of the current <ul>'s descendant node
    // originNode === the <ul> element
});
```

The [dependencies parameter](../obtaining-data-from-the-client.md#optionsdependencies) allows
you to pass objects to the `filterFn` client-side scope where they appear as variables.

```js
const isNodeOk = ClientFunction((node, idx, originNode) => { /*...*/ });

Selector('ul').find((node, idx, originNode) => {
    return isNodeOk(node, idx, originNode);
}, { isNodeOk });
```

#### parent

Method | Description
------ | -----
`parent()` | Finds all parents of all nodes in the matching set (first element in the set will be the closest parent).
`parent(index)` | Finds all parents of all nodes in the matching set and filters them by `index` (0 is closest). If `index` is negative, the index is counted from the end of the matching set.
`parent(cssSelector)` | Finds all parents of all nodes in the matching set and filters them by `cssSelector`.
`parent(filterFn, dependencies)` | Finds all parents of all nodes in the matching set and filters them by the `filterFn` predicate. Use an optional `dependencies` parameter to pass functions, variables or objects used in the `filterFn` function internally.

The `filterFn` predicate is executed on the client. It takes the following parameters.

Parameter | Description
------ | -----
`node`  | The current parent node.
`idx` | Index of `node` among other parent nodes.
`originNode` | A node from the left-hand selector's matching set whose parents are being iterated.

```js
Selector('label').parent((node, idx, originNode) => {
    // node === the <label>'s parent element
    // idx === index of the current <label>'s parent element
    // originNode === the <label> element
});
```

The [dependencies parameter](../obtaining-data-from-the-client.md#optionsdependencies) allows
you to pass objects to the `filterFn` client-side scope where they appear as variables.

```js
const isNodeOk = ClientFunction((node, idx, originNode) => { /*...*/ });

Selector('ul').parent((node, idx, originNode) => {
    return isNodeOk(node, idx, originNode);
}, { isNodeOk });
```

#### child

Method | Description
------ | -----
`child()` | Finds all child elements (not nodes) of all nodes in the matching set.
`child(index)` | Finds all child elements (not nodes) of all nodes in the matching set and filters them by `index`. If `index` is negative, the index is counted from the end of the matching set.
`child(cssSelector)` | Finds all child elements (not nodes) of all nodes in the matching set and filters them by `cssSelector`.
`child(filterFn, dependencies)` | Finds all child elements (not nodes) of all nodes in the matching set and filters them by the `filterFn` predicate. Use an optional `dependencies` parameter to pass functions, variables or objects used in the `filterFn` function internally.

The `filterFn` predicate is executed on the client. It takes the following parameters.

Parameter | Description
------ | -----
`node`  | The current child node.
`idx` | Index of `node` among other child nodes.
`originNode` | A node from the left-hand selector's matching set whose children are being iterated.

```js
Selector('form').child((node, idx, originNode) => {
    // node === the <form>'s child node
    // idx === index of the current <form>'s child node
    // originNode === the <form> element
});
```

The [dependencies parameter](../obtaining-data-from-the-client.md#optionsdependencies) allows
you to pass objects to the `filterFn` client-side scope where they appear as variables.

```js
const isNodeOk = ClientFunction((node, idx, originNode) => { /*...*/ });

Selector('ul').child((node, idx, originNode) => {
    return isNodeOk(node, idx, originNode);
}, { isNodeOk });
```

#### sibling

Method | Description
------ | -----
`sibling()` | Finds all sibling  elements (not nodes) of all nodes in the matching set.
`sibling(index)` | Finds all sibling  elements (not nodes) of all nodes in the matching set and filters them by `index`. If `index` is negative, the index is counted from the end of the matching set.
`sibling(cssSelector)` | Finds all sibling elements (not nodes) of all nodes in the matching set and filters them by `cssSelector`.
`sibling(filterFn, dependencies)` |  Finds all sibling elements (not nodes) of all nodes in the matching set and filters them by the `filterFn` predicate. Use an optional `dependencies` parameter to pass functions, variables or objects used in the `filterFn` function internally.

The `filterFn` predicate is executed on the client. It takes the following parameters.

Parameter | Description
------ | -----
`node`  | The current sibling node.
`idx` | Index of `node` among other sibling nodes.
`originNode` | A node from the left-hand selector's matching set whose siblings are being iterated.

```js
Selector('section').sibling((node, idx, originNode) => {
    // node === the <section>'s sibling node
    // idx === index of the current <section>'s sibling node
    // originNode === the <section> element
});
```

The [dependencies parameter](../obtaining-data-from-the-client.md#optionsdependencies) allows
you to pass objects to the `filterFn` client-side scope where they appear as variables.

```js
const isNodeOk = ClientFunction((node, idx, originNode) => { /*...*/ });

Selector('ul').sibling((node, idx, originNode) => {
    return isNodeOk(node, idx, originNode);
}, { isNodeOk });
```

#### nextSibling

Method | Description
------ | -----
`nextSibling()` | Finds all succeeding sibling elements (not nodes) of all nodes in the matching set.
`nextSibling(index)` | Finds all succeeding sibling elements (not nodes) of all nodes in the matching set and filters them by `index`. If `index` is negative, the index is counted from the end of the matching set.
`nextSibling(cssSelector)` | Finds all succeeding sibling elements (not nodes) of all nodes in the matching set and filters them by `cssSelector`.
`nextSibling(filterFn, dependencies)` |  Finds all succeeding sibling elements (not nodes) of all nodes in the matching set and filters them by the `filterFn` predicate. Use an optional `dependencies` parameter to pass functions, variables or objects used in the `filterFn` function internally.

The `filterFn` predicate is executed on the client. It takes the following parameters.

Parameter | Description
------ | -----
`node`  | The current succeeding sibling node.
`idx` | Index of `node` among other succeeding sibling nodes.
`originNode` | A node from the left-hand selector's matching set whose siblings are being iterated.

```js
Selector('section').nextSibling((node, idx, originNode) => {
    // node === the <section>'s succeeding sibling node
    // idx === index of the current <section>'s succeeding sibling node
    // originNode === the <section> element
});
```

The [dependencies parameter](../obtaining-data-from-the-client.md#optionsdependencies) allows
you to pass objects to the `filterFn` client-side scope where they appear as variables.

```js
const isNodeOk = ClientFunction((node, idx, originNode) => { /*...*/ });

Selector('ul').nextSibling((node, idx, originNode) => {
    return isNodeOk(node, idx, originNode);
}, { isNodeOk });
```

#### prevSibling

Method | Description
------ | -----
`prevSibling()` | Finds all preceding sibling elements (not nodes) of all nodes in the matching set.
`prevSibling(index)` | Finds all preceding sibling elements (not nodes) of all nodes in the matching set and filters them by `index`. If `index` is negative, the index is counted from the end of the matching set.
`prevSibling(cssSelector)` | Finds all preceding sibling elements (not nodes) of all nodes in the matching set and filters them by `cssSelector`.
`prevSibling(filterFn, dependencies)` |  Finds all preceding sibling elements (not nodes) of all nodes in the matching set and filters them by the `filterFn` predicate. Use an optional `dependencies` parameter to pass functions, variables or objects used in the `filterFn` function internally.

The `filterFn` predicate is executed on the client. It takes the following parameters.

Parameter | Description
------ | -----
`node`  | The current preceding sibling node.
`idx` | Index of `node` among other preceding sibling nodes.
`originNode` | A node from the left-hand selector's matching set whose siblings are being iterated.

```js
Selector('section').prevSibling((node, idx, originNode) => {
    // node === the <section>'s preceding sibling node
    // idx === index of the current <section>'s preceding sibling node
    // originNode === the <section> element
});
```

The [dependencies parameter](../obtaining-data-from-the-client.md#optionsdependencies) allows
you to pass objects to the `filterFn` client-side scope where they appear as variables.

```js
const isNodeOk = ClientFunction((node, idx, originNode) => { /*...*/ });

Selector('ul').prevSibling((node, idx, originNode) => {
    return isNodeOk(node, idx, originNode);
}, { isNodeOk });
```

**Example**

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

### Examples

```js
Selector('ul').find('label').parent('div.someClass')
```

Finds all `ul` elements on page. Then, in each found `ul` element finds `label` elements.
Then, for each `label` element finds a parent that matches the `div.someClass` selector.

------

Like in jQuery, if you request a [property](./dom-node-state.md#members-common-across-all-nodes) of the matching set or try evaluate
a [snapshot](#dom-node-snapshot), the selector returns values for the first element in the set.

```js
// Returns id of the first element in the set
const id = await Selector('ul').find('label').parent('div.someClass').id;

// Returns snapshot for the first element in the set
const snapshot = await Selector('ul').find('label').parent('div.someClass')();
```

------

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

## Using Selectors

### Check if an Element Exists

Functions and CSS selector strings that initialize a selector may return
a single matching DOM element on the page, multiple elements or nothing.
You can use the following Selector properties to check whether matching
elements exist and determine the number of matching elements.

Property | Type | Description
------ | ----- | -----
`exists` | Boolean | `true` if at least one matching element exists.
`count` | Number | The number of matching elements.

```js
import { Selector } from 'testcafe';

fixture `Example page`
    .page `http://devexpress.github.io/testcafe/example/`;

test('My test', async t => {
    const osCount            = Selector('.column.col-2 label').count;
    const submitButtonExists = Selector('#submit-button').exists;

    await t
        .expect(osCount).eql(3)
        .expect(submitButtonExists).ok();
});
```

Note that selector property getters are asynchronous.

### Obtain Element State

Selectors and promises returned by selectors expose API to get the state (size, position, classes, etc.) of the matching element.
See [DOM Node State](./dom-node-state.md). Note that these methods and property getters
are asynchronous, so use `await` to obtain an element's property.

```js
const headerText = await Selector('#header').textContent;
```

**Example**

```js
import { Selector } from 'testcafe';

fixture `My fixture`
    .page('http://devexpress.github.io/testcafe/example/');

const windowsInput = Selector('#windows');

test('Obtain Element State', async t => {
    await t.click(windowsInput);

    const windowsInputChecked = await windowsInput.checked; // returns true
});
```

#### DOM Node Snapshot

If you need to get the entire DOM element state, call the selector
with the `await` keyword like you would do with regular async functions.
It returns a *DOM Node Snapshot* that contains [all property values](dom-node-state.md)
exposed by the selector in a single object.

```js
import { Selector } from 'testcafe';

fixture `My fixture`
    .page `http://devexpress.github.io/testcafe/example/`;

test('DOM Node Snapshot', async t => {
    const sliderHandle = await Selector('#slider').child('span');

    await t
        .expect(sliderHandle.hasClass('ui-slider-handle')).ok()
        .expect(sliderHandle.childElementCount).eql(0)
        .expect(sliderHandle.visible).ok();
});
```

Note that if a selector initializer has several matching DOM nodes on the page,
the selector returns the first node from the matching set.

> It's not recommended to pass DOM Node Snapshot's properties
to [built-in assertions](../assertions/index.md) to check the state of the element.
To enable [Smart Assertion Query Mechanism](../assertions/index.md#smart-assertion-query-mechanism)
pass [selector's properties](./dom-node-state.md#members-common-across-all-nodes) to assertions instead.

### Define Action Targets

You can pass selectors to [test actions](../actions/index.md) to use the returned element as the action target.

```js
import { Selector } from 'testcafe';

fixture `My fixture`
    .page `http://devexpress.github.io/testcafe/example/`;

const label = Selector('#tried-section').child('label');

test('My Test', async t => {
    await t.click(label);
});
```

DOM element snapshots can also be passed to test actions.

```js
import { Selector } from 'testcafe';

fixture `My fixture`
    .page `http://devexpress.github.io/testcafe/example/`;

const label = Selector('#tried-section').child('label');

test('My Test', async t => {
    const labelSnapshot = await label();

    await t.click(labelSnapshot);
});
```

In this instance, the selector that was used to fetch this snapshot will be called once again.

Before executing an action, TestCafe waits for the target element to appear
in the DOM and become visible. If this does not happen
within the [selector timeout](#selector-timeout), the test fails.

Note that if a selector initializer has multiple matching DOM nodes on the page, the action will be executed only for the first node from the matching set.

### Define Assertion Actual Value

You can check whether a particular DOM node has an expected state by passing a selector property directly to [assertions](../assertions/index.md).
In this case TestCafe enables [Smart Assertion Query Mechanism](../assertions/index.md#smart-assertion-query-mechanism) to avoid accidental errors and unstable tests.

```js
import { Selector } from 'testcafe';

fixture `My fixture`
    .page `http://devexpress.github.io/testcafe/example/`;

test('Assertion with Selector', async t => {
    const developerNameInput = Selector('#developer-name');

    await t
        .expect(developerNameInput.innerText).eql('')
        .typeText(developerNameInput, 'Peter')
        .expect(developerNameInput.innerText).eql('Peter');
});
```

In this example the `developerNameInput.innerText` property will not be
calculated immediately, but it will wait until the assertion is executed.

### Selector Timeout

When a selector is called in test code, TestCafe waits for the target node to appear
in the DOM within the *selector timeout*.

You can specify the selector timeout in test code by using the [timeout](selector-options.md#optionstimeout) option.
To set this timeout when launching tests, pass it to the [runner.run](../../using-testcafe/programming-interface/runner.md#run)
method if you use API or specify the [selector-timeout](../../using-testcafe/command-line-interface.md#--selector-timeout-ms) option
if you run TestCafe from the command line.

Within the selector timeout, the selector is executed over and over again, until it returns a
DOM node or the timeout exceeds.

Note that you can additionally require that the node returned by the selector is visible.
To do this, use the [visibilityCheck](selector-options.md#optionsvisibilitycheck) option.

## Adding Custom Properties to Element State

TestCafe allows you to extend [element state](#obtain-element-state) with custom properties calculated on the client side.

To do this, use the selector's `addCustomDOMProperties` method.

```text
Selector().addCustomDOMProperties({
    property1: fn1,
    property2: fn2,
    /* ... */
});
```

Parameter                     | Type     | Description
----------------------------- | -------- | -----------
`property1`, `property2`, ... | String   | Property names.
`fn1`, `fn2`, ...             | Function | Functions that calculate property values. Executed on the client side in the browser.

Functions that calculate property values (`fn1`, `fn2`, ...) take the following parameters.

Parameter   | Type     | Description
----------- | -------- | -----------
`node`      | Object   | The DOM node.

**Example**

```js
import { Selector } from 'testcafe';

fixture `My fixture`
    .page `https://devexpress.github.io/testcafe/example/`;

test('Check Label HTML', async t => {
    const label = Selector('label').addCustomDOMProperties({
        innerHTML: el => el.innerHTML
    });

    await t.expect(label.innerHTML).contains('input type="checkbox" name="remote"');
});
```

## One-Time Selection

> Important! ***Deprecated*** *Use [selectors](#creating-selectors) instead. The `select` method of the [test controller](../test-code-structure.md#test-controller) will be removed in future releases.*

To create a selector and immediately execute it without saving it, use the `select` method of the [test controller](../test-code-structure.md#test-controller).

```text
t.select( init [, options] )
```

Parameter              | Type     | Description
---------------------- | -------- | ------------------------------------------------------------------
`init`                 | Function &#124; String &#124; Selector &#124; Snapshot &#124; Promise | Identifies a DOM node to be selected; see [Selector Initializers](#selector-initializers).
`options`&#160;*(optional)* | Object   | See [Options](selector-options.md).

The following example shows how to get a DOM element by ID with `t.select`.

```js
fixture `My fixture`
    .page `http://devexpress.github.io/testcafe/example/`;

test('My Test', async t => {
    const header = await t.select('header');
});
```

## Calling Selectors from Node.js Callbacks

Selectors need access to the [test controller](../test-code-structure.md#test-controller) to be executed.
When called right from the test function, they implicitly obtain the test controller.

However, if you need to call a selector from a Node.js callback that fires during the test run,
you have to manually bind it to the test controller.

Use the [boundTestRun](selector-options.md#optionsboundtestrun) option for this.

```js
import { http } from 'http';
import { Selector } from 'testcafe';

fixture `My fixture`
    .page `http://www.example.com/`;

const elementWithId = Selector(id => document.getElementById(id));

test('Title changed', async t => {
    const boundSelector = elementWithId.with({ boundTestRun: t });

    // Performs an HTTP request that changes the article title on the page.
    // Resolves to a value indicating whether the title has been changed.
    const match = await new Promise(resolve => {
        const req = http.request(/* request options */, res => {
            if(res.statusCode === 200) {
                boundSelector('article-title').then(titleEl => {
                    resolve(titleEl.textContent === 'New title');
                });
            }
        });

        req.write(title)
        req.end();
    });

    await t.expect(match).ok();
});
```

This approach only works for Node.js callbacks that fire during the test run. To ensure that the test function
does not finish before the callback is executed, suspend the test until the callback fires. You can do this
by introducing a promise and synchronously waiting for it to complete as shown in the example above.

## Limitations

* You cannot use generators or `async/await` syntax within selectors.

* Selectors cannot access variables defined in the outer scope in test code.
  However, you can use arguments to pass data inside the selectors, except for those that are self-invoked.
  They cannot take any parameters from the outside.

    Likewise, the return value is the only way to obtain data from selectors.
