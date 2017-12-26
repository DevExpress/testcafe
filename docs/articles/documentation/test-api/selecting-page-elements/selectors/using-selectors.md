---
layout: docs
title: Using Selectors
permalink: /documentation/test-api/selecting-page-elements/selectors/using-selectors.html
checked: false
---
# Using Selectors

This topic describes how to identify DOM elements and obtain information about them using selectors.

* [Check if an Element Exists](#check-if-an-element-exists)
* [Obtain Element State](#obtain-element-state)
  * [DOM Node Snapshot](#dom-node-snapshot)
* [Define Action Targets](#define-action-targets)
* [Define Assertion Actual Value](#define-assertion-actual-value)
* [Selector Timeout](#selector-timeout)

## Check if an Element Exists

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

## Obtain Element State

Selectors and promises returned by selectors expose API to get the state (size, position, classes, etc.) of the matching element.
See [DOM Node State](../dom-node-state.md). Note that these methods and property getters
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

### DOM Node Snapshot

If you need to get the entire DOM element state, call the selector
with the `await` keyword like you would do with regular async functions.
It returns a *DOM Node Snapshot* that contains [all property values](../dom-node-state.md)
exposed by the selector in a single object.

```js
import { Selector } from 'testcafe';

fixture `My fixture`
    .page `http://devexpress.github.io/testcafe/example/`;

test('DOM Node Snapshot', async t => {
    const sliderHandle        = Selector('#slider').child('span');
    const sliderHandleSnaphot = await sliderHandle();

    console.log(sliderHandleSnaphot.hasClass('ui-slider-handle'));    // => true
    console.log(sliderHandleSnaphot.childElementCount);               // => 0
});
```

Note that if a selector initializer has several matching DOM nodes on the page,
the selector returns the first node from the matching set.

> It's not recommended to pass DOM Node Snapshot's properties
to [built-in assertions](../../assertions/README.md) to check the state of the element.
To enable [Smart Assertion Query Mechanism](../../assertions/README.md#smart-assertion-query-mechanism)
pass [selector's properties](../dom-node-state.md#members-common-across-all-nodes) to assertions instead.

## Define Action Targets

You can pass selectors to [test actions](../../actions/README.md) to use the returned element as the action target.

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

Note that if a selector initializer has multiple matching DOM nodes on the page,
the action will be executed only for the first node from the matching set.

## Define Assertion Actual Value

You can check whether a particular DOM node has the expected state by passing a selector property directly to [assertions](../../assertions/README.md).
In this case, TestCafe enables [Smart Assertion Query Mechanism](../../assertions/README.md#smart-assertion-query-mechanism)
to avoid accidental errors and unstable tests.

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

## Selector Timeout

When a selector is called in test code, TestCafe waits for the target node to appear
in the DOM within the *selector timeout*.

You can specify the selector timeout in test code by using the [timeout](selector-options.md#optionstimeout) option.
To set this timeout when launching tests, pass it to the [runner.run](../../../using-testcafe/programming-interface/runner.md#run)
method if you use API or specify the [selector-timeout](../../../using-testcafe/command-line-interface.md#--selector-timeout-ms) option
if you run TestCafe from the command line.

Within the selector timeout, the selector is executed over and over again, until it returns a
DOM node or the timeout exceeds.

Note that you can additionally require that the node returned by the selector is visible.
To do this, use the [visibilityCheck](selector-options.md#optionsvisibilitycheck) option.
