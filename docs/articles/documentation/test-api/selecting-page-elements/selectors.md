---
layout: docs
title: Selectors
permalink: /documentation/test-api/selecting-page-elements/selectors.html
checked: false
---
# Selectors

A selector is a function that identifies a webpage element in the test.
The selector API provides methods and properties to select elements on the page and get theirs state.
You can use selectors to [define action targets](#define-action-targets),
[define assertion actual value](#define-assertion-actual-value) or
[inspect elements state on the page](#obtain-element-state).

> Important! Do not modify the tested webpage within selectors.
> To interact with the page, use [test actions](../actions/index.md).

This topic contains the following sections.

* [Creating Selectors](#creating-selectors)
* [Selector Initializers](#selector-initializers)
* [Combined Selectors](#combined-selectors)
  * [Filter Multiple DOM Nodes](#filter-multiple-dom-nodes)
      * [nth](#nth)
      * [withText](#withtext)
      * [filter](#filter)
  * [Find Elements by DOM Hierarchy](#find-elements-by-dom-hierarchy)
      * [find](#find)
      * [parent](#parent)
      * [child](#child)
      * [sibling](#sibling)
  * [Filter Predicate](#filter-predicate)
  * [Examples](#examples)
* [Using Selectors](#using-selectors)
  * [Get Selector Matching Set Length](#get-selector-matching-set-length)
  * [Obtain Element State](#obtain-element-state)
  * [Define Action Targets](#define-action-targets)
  * [Define Assertion Actual Value](#define-assertion-actual-value)
  * [Selector Timeout](#selector-timeout)
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

## Combined Selectors

The selector API provides methods that can be combined together, thus
providing you with a flexible functional-style selector mechanism.

### Filter Multiple DOM Nodes

If selector returns multiple DOM nodes, you must filter them to select
a single node that will eventually be returned by the selector.
The selector provides methods to filter DOM nodes by their index or text.

#### nth

Method | Type | Description
------ | ----- | -----
`nth(index)` | Selector | Creates a selector that returns an element by its index in the matching set.

#### withText

Method | Type | Description
------ | ----- | -----
`withText(text)` | Selector | Creates a selector that filters a matching set by the specified text.
`withText(re)` | Selector | Creates a selector that filters a matching set using the specified regular expression.

#### filter

Method | Type | Description
------ | ----- | -----
`filter(index)` | Selector | Creates a selector that filters a matching set by `index`.
`filter(cssSelector)` | Selector | Creates a selector that filters a matching set by `cssSelector`.
`filter(filterFn, dependencies)` | Selector | Creates a selector that filters a matching set by `filterFn` [filter predicate](#filter-predicate). Use an optional `dependencies` parameter to pass functions, variables or objects used in the `filterFn` function internally.

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

### Find Elements by DOM Hierarchy

The selector API provides methods to find elements within a DOM hierarchy in jQuery style.

#### find

Property | Description
------ | -----
`find(cssSelector)` | Finds all descendants of all nodes in the matching set and filters them by `cssSelector`.
`find(filterFn, dependencies)` | Finds all descendants of all nodes in the matching set and filters them using `filterFn` [filter predicate](#filter-predicate). Use an optional `dependencies` parameter to pass functions, variables or objects used in the `filterFn` function internally.

#### parent

Property | Description
------ | -----
`parent()` | Finds all parents of all nodes in the matching set (first element in the set will be the closest parent).
`parent(index)` | Finds all parents of all nodes in the matching set and filters them by `index` (0 is closest).
`parent(cssSelector)` | Finds all parents of all nodes in the matching set and filters them by `cssSelector`.
`parent(filterFn, dependencies)` | Finds all parents of all nodes in the matching set and filters them by `filterFn` [filter predicate](#filter-predicate). Use an optional `dependencies` parameter to pass functions, variables or objects used in the `filterFn` function internally.

#### child

Property | Description
------ | -----
`child()` | Finds all child elements (not nodes) of all nodes in the matching set.
`child(index)` | Finds all child elements (not nodes) of all nodes in the matching set and filters them by `index`.
`child(cssSelector)` | Finds all child elements (not nodes) of all nodes in the matching set and filters them by `cssSelector`.
`child(filterFn, dependencies)` | Finds all child elements (not nodes) of all nodes in the matching set and filters them by `filterFn` [filter predicate](#filter-predicate). Use an optional `dependencies` parameter to pass functions, variables or objects used in the `filterFn` function internally.

#### sibling

Property | Description
------ | -----
`sibling()` | Finds all sibling  elements (not nodes) of all nodes in the matching set.
`sibling(index)` | Finds all sibling  elements (not nodes) of all nodes in the matching set and filters them by `index`.
`sibling(cssSelector)` | Finds all sibling elements (not nodes) of all nodes in the matching set and filters them by `cssSelector`.
`sibling(filterFn, dependencies)` |  Finds all sibling elements (not nodes) of all nodes in the matching set and filters them by `filterFn` [filter predicate](#filter-predicate). Use an optional `dependencies` parameter to pass functions, variables or objects used in the `filterFn` function internally.

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

### Filter Predicate

The `filterFn` function used in `filter`, `find`, `parent`, `child` and `sibling` methods is a predicate that is executed on the client side.

This predicate takes the following parameters.

Property | Description
------ | -----
`node`  | The current DOM node.
`idx` | Index of the current node among other nodes in the matching set.
`originNode` | Node returned by the preceding selector.

**Example**

```js
Selector('ul').child((node, idx, originNode) => {
    // node === the <ul>'s child element
    // idx === index of the current <ul>'s child element
    // originNode === the <ul> element
}));
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

### Get Selector Matching Set Length

Functions and CSS selector strings that initialize a selector may return
a single matching DOM element on the page, multiple elements or nothing.
You can use the following Selector properties to check whether the matching
elements exist or get a number of them.

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

Selectors and promises returned by selectors expose API to get state (size, position, classes, etc.) of matched element.
See [DOM Node State](./dom-node-state.md). Note that these methods and property getters
are asynchronous so you can obtain element's property from a browser in the following way:

```js
const headerText = await Selector('#header').textConent;
```

For example:

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

If you need to get all state properties of the DOM element at once call the selector
with the `await` keyword like you would do with regular async functions.
It returns a *DOM Node Snapshot* that contains [all property values](dom-node-state.md)
exposed by selector in single object.

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
calculated immediately, but only then assertion will be executed.

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
