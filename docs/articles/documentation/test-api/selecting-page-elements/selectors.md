---
layout: docs
title: Selectors
permalink: /documentation/test-api/selecting-page-elements/selectors.html
checked: false
---
# Selectors

A selector is a function that is executed in the browser and returns a DOM node.
The identification and state of this node are passed to the server where
they can be used to define an [action's](../actions/index.md) target or
provide information for an [assertion](../assertions.md).

> Important! Do not modify the tested webpage within selectors.
> To interact with the page, use [test actions](../actions/index.md).

This topic contains the following sections.

* [Creating Selectors](#creating-selectors)
* [Selector Initializers](#selector-initializers)
  * [Check Selector Matching Set Length](#check-selector-matching-set-length)
* [Combined Selectors](#combined-selectors)
  * [Filter Multiple DOM Nodes](#filter-multiple-dom-nodes)
  * [Find Elements by DOM Hierarchy](#find-elements-by-dom-hierarchy)
  * [Examples](#examples)
* [Executing Selectors](#executing-selectors)
  * [DOM Node Snapshots](#dom-node-snapshots)
      * [Snapshot API Shorthands](#snapshot-api-shorthands)
  * [Selector Timeout](#selector-timeout)
* [One-Time Selection](#one-time-selection)
* [Using Selectors to Define Action Targets](#using-selectors-to-define-action-targets)
* [Using Selectors to Define Assertion Actual Value](#using-selectors-to-define-assertion-actual-value)
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

> Important! Selectors cannot return anything but a single DOM node or `null`.
> Use [client functions](../obtaining-data-from-the-client.md) to return arbitrary data.

The following example creates a selector from a function that returns a DOM element by its ID.

```js
import { Selector } from 'testcafe';

const elementWithId = Selector(id => document.getElementById(id));
```

## Selector Initializers

You can initialize a selector with any of these objects.

* A regular function. Executed on the client side. Must return a DOM node, array of DOM nodes,
  NodeList, HTMLCollection, `null` or `undefined`. Cannot use outer-scope variables from test code.

    ```js
    import { Selector } from 'testcafe';

    // A selector is created from a regular function.
    // This selector will take the 'id' parameter and return
    // a DOM element that has this ID.
    const elementWithId = Selector(id => document.getElementById(id));
    ```

* A CSS selector string that matches one or several nodes.

    ```js
    import { Selector } from 'testcafe';

    // A selector is created from a CSS selector string.
    // This selector will return the first matching DOM node.
    // You can execute this selector or pass it as a parameter to an action or assertion.
    const submitButton = Selector('#submit-button');
    ```

* A selector.

    ```js
    import { Selector } from 'testcafe';

    // This selector is created from a function that returns all elements of a specified class.
    const elementsWithClass = Selector(cl => document.getElementsByClassName(cl), {
        visibilityCheck: true
    });

    // This selector is created based on the previous selector and inherits
    // its initializer, but overwrites the `visibilityCheck` parameter.
    Selector(elementsWithClass, { visibilityCheck: false });
    ```

* A [DOM node snapshot](#dom-node-snapshots).

    ```js
    import { Selector } from 'testcafe';

    fixture `My fixture`
        .page `http://www.example.com/`;

    test('My Test', async t => {
        const topMenuSnapshot = await Selector('#top-menu')();

        // This selector is created from a DOM node snapshot returned
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

    const elementWithId = Selector(id => document.getElementById(id));

    fixture `My fixture`
        .page `http://www.example.com/`;

    test('My Test', async t => {

        // This selector is created from a promise returned by a call to a
        // different selector. The new selector will be initialized with the
        // same function as the old one and with hard-coded parameter values
        // as in the previous example.
        const submitButton = Selector(elementWithId('submit-button'));
    });
    ```

### Check Selector Matching Set Length

Functions and CSS selector strings that initialize a selector may return a single matching DOM element on the page, multiple elements or nothing.
You can use the following Selector properties to check whether the matching elements exist or get a number of them.

Property | Type | Description
------ | ----- | -----
`exists` | Boolean | `true` if at least one matching element exists.
`count` | Number | The number of matching elements.

```js
import { Selector } from 'testcafe';
import { expect } from 'chai';

fixture `Example page`
    .page `http://devexpress.github.io/testcafe/example/`;

test('My test', async t => {
    const osCount            = await Selector('.column.col-2 label').count;
    const submitButtonExists = await Selector('#submit-button').exists;

    expect(osCount).eql(3);
    expect(submitButtonExists).is.true;
});

```

Note that selector property getters are asynchronous.

## Combined Selectors

The selector API provides methods that can be combined together, thus providing you with a flexible functional-style selector mechanism.

### Filter Multiple DOM Nodes

If selector returns multiple DOM nodes you must filter them to select a single node that will eventually be returned by the selector.
Selector provides methods to filter DOM nodes by their index or text:

Method | Type | Description
------ | ----- | -----
`nth(index)` | Selector | Creates selector that return an element by its index in the matching set.
`withText(text)` | Selector | Creates selector that filters matching set by the specified text.
`withText(re)` | Selector | Creates selector that filters matching set using the specified regular expression.

```js
import { expect } from 'chai';
import { Selector } from 'testcafe';


fixture `Example page`
    .page `http://devexpress.github.io/testcafe/example/`;

test('My test', async t => {
    const secondCheckBox = Selector('input[type=checkbox]').nth(1);
    const windowsLabel   = Selector('label').withText('Windows');

    await t
        .click(secondCheckBox)
        .click(windowsLabel);
});
```

If all nodes are filtered out, the selector returns `null`.

### Find Elements by DOM Hierarchy

The selector API provides methods to find elements within a DOM hierarchy in jQuery style.

Property | Description
------ | -----
`find(cssSelector)` | Finds all descendants of all nodes in the matching set and filters them by `cssSelector`.
`find(filterFn)` | Finds all descendants of all nodes in the matching set and filters them using `filterFn`. `filterFn` is a client function predicate that receives a node.
`parent()` | Finds all parents of all nodes in the matching set.
`parent(index)` | Finds all parents of all nodes in the matching set and filters them by `index` (0 is closest).
`parent(cssSelector)` | Finds all parents of all nodes in the matching set and filters them by `cssSelector`.
`parent(filterFn)` | Finds all parents of all nodes in the matching set and filters them by `filterFn`. `filterFn` is a client function predicate that receives a node.
`child()` | Finds all child elements (not nodes) of all nodes in the matching set.
`child(index)` | Finds all child elements (not nodes) of all nodes in the matching set and filters them by `index`.
`child(cssSelector)` | Finds all child elements (not nodes) of all nodes in the matching set and filters them by `cssSelector`.
`child(filterFn)` | Finds all child elements (not nodes) of all nodes in the matching set and filters them by `filterFn`. `filterFn` is a client function predicate that receives node.
`sibling()` | Finds all sibling  elements (not nodes) of all nodes in the matching set.
`sibling(index)` | Finds all sibling  elements (not nodes) of all nodes in the matching set and filters them by `index`.
`sibling(cssSelector)` | Finds all sibling elements (not nodes) of all nodes in the matching set and filters them by `cssSelector`.
`sibling(filterFn)` |  Finds all sibling elements (not nodes) of all nodes in the matching set and filters them by `filterFn`. `filterFn` is a client function predicate that receives a node.

```js
import { expect } from 'chai';
import { Selector } from 'testcafe';


fixture `Example page`
    .page `http://devexpress.github.io/testcafe/example/`;

test('My test', async t => {
    const macOSRadioButton = Selector('.column.col-2').find('label').child(el => el.value === 'MacOS');

    await t.click(macOSRadioButton.parent());

    expect(await macOSRadioButton.checked).to.be.true;
});
```

### Examples

```js
Selector('ul').find('label').parent('div.someClass')
```

Finds all `ul` elements on page. Then in each found `ul` element finds `label` elements.
Then for each `label` element finds parent that matches `div.someClass` selector.

------

Like in jQuery, if you request a property of the matching set or try evaluate a snapshot it returns values for the first element in the set:

```js
// Returns id of the first element in the set
const id = await Selector('ul').find('label').parent('div.someClass').id;

// Returns snapshot for the first element in the set
const snapshot = await Selector('ul').find('label').parent('div.someClass')();
```

------

However, you can obtain data for any element in the set by using `nth` filter:

```js
// Returns id of the third element in the set
const id = await Selector('ul').find('label').parent('div.someClass').nth(2).id;

// Returns snapshot for the fourth element in the set
const snapshot = await Selector('ul').find('label').parent('div.someClass').nth(4)();
```

------

Note that you can add text and index filters in the selector chain:

```js
Selector('.container').parent(1).nth(0).find('.content').withText('yo!').child('span');
```

Finds the second parent (parent of parent) of `.container` elements. Peeks first element in the matching set. Then in that element finds elements that matches `.content` selector. Filter them by text `yo!`. And in each filtered element searches for a child with tag name `span`.

------

## Executing Selectors

To execute a selector, call it with the `await` keyword like you would do with regular async functions.

```js
import { Selector } from 'testcafe';

const elementWithId = Selector(id => document.getElementById(id));

fixture `My fixture`
    .page `http://www.example.com/`;

test('My test', async t => {
    const button = await elementWithId('my-button');
    const div    = await Selector('.myDiv')();
});
```

Note that if a selector initializer has several matching DOM nodes on the page, the selector returns the first node from the matching set.

### DOM Node Snapshots

TestCafe executes tests on the server, so selectors cannot return actual DOM objects to test code.
Instead, they return *DOM node snapshots* - server-side representation of the node's state.

A snapshot contains information about the node's size, position, classes, parent and child nodes, etc.
It exposes [API](dom-node-snapshots.md) that is similar to DOM objects.

```js
import { expect } from 'chai';
import { Selector } from 'testcafe';

fixture `My fixture`
    .page `http://www.example.com/`;

test('Login field height', async t => {
    const loginInput = await Selector('#login');

    expect(loginInput.offsetWidth).to.equal(95);
    expect(loginInput.offsetHeight).to.equal(35);
    expect(loginInput.hasClass('glow')).to.be.ok;
});
```

For a list of members exposed by DOM node snapshots, see [DOM Node Snapshots](dom-node-snapshots.md).

#### Snapshot API Shorthands

Selectors and promises returned by selectors expose snapshot API directly (except for
snapshot's `getChildElement`, `getChildNode` and `getParentNode` methods).
This is convenient when you need to use only one snapshot property or method.
In this instance, you save a line of code, because you do not need to obtain and save the snapshot object explicitly.

```js
import { expect } from 'chai';
import { Selector } from 'testcafe';

const loginInput    = Selector('#login-box');
const elementWithId = Selector(id => document.getElementById(id));

fixture `My fixture`
    .page('http://www.example.com/');

test('Login field height', async t => {
    expect(await loginInput.offsetWidth).to.equal(95);
    expect(await elementWithId('password-box').offsetHeight).to.equal(35);
});
```

Note that snapshot methods and property getters exposed through selectors are asynchronous.

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
`init`                 | Function &#124; String &#124; Selector &#124; Snapshot &#124; Promise | Identifies a DOM node to be selected. See [Selector Initializers](#selector-initializers).
`options`&#160;*(optional)* | Object   | See [Options](selector-options.md).

The following example shows how to get a DOM element by ID with `t.select`.

```js
fixture `My fixture`
    .page `http://www.example.com/`;

test('My Test', async t => {
    const header = await t.select(() => document.getElementById('header'));
});
```

## Using Selectors to Define Action Targets

You can pass selectors to [test actions](../actions/index.md) to use the returned element as the action target.

```js
import { Selector } from 'testcafe';

fixture `My fixture`
    .page `http://www.example.com/`;

const lastItem = Selector(() => document.querySelector('.toc-item:last-child'));

test('My Test', async t => {
    await t.click(lastItem);
});
```

In this instance, the selector will be called with no arguments.

You can also pass a promise returned by a selector if you need to call it with arguments.

```js
import { Selector } from 'testcafe';

const elementWithId = Selector(id => document.getElementById(id));

fixture `My fixture`
    .page `http://www.example.com/`;

test('My Test', async t => {
    await t.click(elementWithId('submit-button'));
});
```

DOM element snapshots can also be passed to test actions.

```js
import { Selector } from 'testcafe';

fixture `My fixture`
    .page `http://www.example.com/`;

test('My Test', async t => {
    const topMenuSnapshot = await Selector('#top-menu');

    await t.click(topMenuSnapshot);
});
```

In this instance, the selector that was used to fetch this snapshot will be called once again.

Before executing an action, TestCafe waits for the target element to appear
in the DOM and become visible. If this does not happen
within the [selector timeout](#selector-timeout), the test fails.

Note that if a selector initializer has multiple matching DOM nodes on the page, the action will be executed only for the first node from the matching set.

## Using Selectors to Define Assertion Actual Value

You can check whether a particular DOM node has an expected state by passing [snapshot API shorthand](#snapshot-api-shorthands) directly to [test actions](../assertions/index.md).

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

## Calling Selectors from Node.js Callbacks

Selectors need access to the [test controller](../test-code-structure.md#test-controller) to be executed.
When called right from the test function, they implicitly obtain the test controller.

However, if you need to call a selector from a Node.js callback that fires during the test run,
you have to manually bind it to the test controller.

Use the [boundTestRun](selector-options.md#optionsboundtestrun) option for this.

```js
import { http } from 'http';
import { expect } from 'chai';
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

    expect(match).to.be.true;
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
