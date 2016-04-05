---
layout: docs
title: Selectors
permalink: /documentation/test-api/selecting-page-elements/selectors.html
---
# Selectors

A selector is a function that is executed in the browser and returns a DOM node whose identification and state are passed to the server.
It can then be used to define an action's target or provide information for an assertion.

> Important! Do not modify the tested webpage within selectors.
> To interact with the page, use [test actions](../actions/index.md).

This topic contains the following sections:

* [Creating Selectors](#creating-selectors)
* [Selector Initializers](#selector-initializers)
  * [Initializers that Return Multiple Nodes](#initializers-that-return-multiple-nodes)
* [Executing Selectors](#executing-selectors)
* [One-Time Selection](#one-time-selection)
* [Return Values. DOM Node Snapshots](#return-values-dom-node-snapshots)
* [Using Selectors to Define Action Targets](#using-selectors-to-define-action-targets)
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
`options` *(optional)* | Object   | See [Options](selector-options.md).

> Important! Selectors cannot return anything but a single DOM node or `null`.
> Use [client functions](../obtaining-data-from-the-client.md) to return arbitrary data.

The following example creates a selector from a function that returns a DOM element by its ID.

```js
import { Selector } from 'testcafe';

const getElement = Selector(id => document.getElementById(id));
```

## Selector Initializers

You can initialize a selector with any of these objects.

* Function. Executed on the client side. Must return a DOM node, array of DOM nodes,
  NodeList, HTMLCollection, `null` or `undefined`. Cannot use outer-scope variables from test code.

    ```js
    import { Selector } from 'testcafe';

    // A selector is created from a regular function.
    // This selector will take the 'id' parameter and return
    // a DOM element with this ID.
    const getElementById = Selector(id => document.getElementById(id));
    ```

* CSS selector string that matches one or several nodes.

    ```js
    import { Selector } from 'testcafe';

    // A selector is created from CSS selector string.
    // This selector will return the first matching DOM node.
    const getSubmitButton = Selector('#submit-button');
    ```

* Selector.

    ```js
    import { Selector } from 'testcafe';

    // This selector is created from a function that returs all elements of a specified class.
    // The selector returns the third such element since its `index` option is set to 2.
    const getThirdElemByClass = Selector(cl => document.getElementsByClassName(cl), {
        index: 2
    });

    // This selector is created based on the previous selector and inherits its initializer,
    // but overwrites the `index` parameter to return the fourth element.
    const getFourthElemOfClass = Selector(getThirdElemByClass, { index: 3 });
    ```

* [DOM node snapshot](#return-values-dom-node-snapshots).

    ```js
    import { Selector } from 'testcafe';

    const getElementById = Selector(id => document.getElementById(id));

    fixture `My fixture`
        .page('http://www.example.com/');

    test('My Test', async t => {
        const topMenuSnapshot = await getElementById('top-menu');

        // This selector is created from a DOM element snapshot returned
        // by a different selector. Effectively, this is equal to the previous example:
        // the new selector uses the same initializer as 'getElementById' while
        // overwriting its options.
        const getVisibleTopMenu = Selector(topMenuSnapshot, {
            visibilityCheck: true
        });
    });
    ```

* Promise returned by a selector.

    ```js
    import { Selector } from 'testcafe';

    const getElementById = Selector(id => document.getElementById(id));

    fixture `My fixture`
        .page('http://www.example.com/');

    test('My Test', async t => {

        // This selector is created from a promise returned by a call to a
        // different selector. The new selector will be initialized with the
        // same function as the old one but with hard-coded parameter values.
        const getSubmitButton = Selector(getElementById('submit-button'));
    });
    ```

### Initializers that Return Multiple Nodes

TestCafe allows the selector's initializing function or CSS selector to return multiple DOM nodes.
In this instance, you must filter these nodes to select a single node that will be returned by the selector (or none of them to return `null`).
Use the [textFilter](selector-options.md#optionstextfilter) and [index](selector-options.md#optionsindex) options for this.

The [textFilter](selector-options.md#optionstextfilter) option specifies text or a regular expression that matches text content of the node to be selected.

The [index](selector-options.md#optionsindex) option specifies the index of the node to be selected.

```js
import { expect } from 'chai';
import { Selector } from 'testcafe';

fixture `My fixture`
    .page('http://www.example.com/');

const getRemoveButtonOfClass = Selector(cl => document.getElementsByClassName(cl), {
    textFilter: 'Remove'
});

const getSecondButtonOfClass = Selector(cl => document.getElementsByClassName(cl), {
    index: 1
});

test('A shadowed remove button is focused', async t => {
    expect((await getRemoveButtonOfClass('shadowed')).focused).to.be.true;
});

test('The second disabled button is visible', async t => {
    expect((await getSecondButtonOfClass('disabled')).visible).to.be.true;
});
```

If both options are specified, nodes are first filtered by the `textFilter`,
then a node at the `index` position is selected from the remaining nodes.

> The [textFilter](selector-options.md#optionstextfilter) and [index](selector-options.md#optionsindex) options
> are also applied when the selector is called from another selector or a [client function](../obtaining-data-from-the-client.md).

## Executing Selectors

To execute a selector, call it with the `await` keyword like you would do with regular async functions.

```js
import { Selector } from 'testcafe';

const getElementById = Selector(id => document.getElementById(id));

fixture `My fixture`
    .page('http://www.example.com/');

test('My test', async t => {
    const button = await getElementById('my-button');
});
```

When a selector is called in test code, TestCafe waits for the target node to appear
in the DOM within the *selector timeout*, which is specified in test code by using the [timeout](selector-options.md#optionstimeout) option
or when launching tests via [API](../../using-testcafe/programming-interface/runner.md#run)
or [CLI](../../using-testcafe/command-line-interface.md#--selector-timeout-ms).
Within this time, the selector is executed over and over again, until it returns a
DOM node or the timeout exceeds.

Note that you can additionally require that the node returned by the selector is visible.
To do this, use the [visibilityCheck](selector-options.md#optionsvisibilitycheck) option.

## One-Time Selection

To create a selector and immediately execute it without saving,
use the `select` method of the [test controller](../test-code-structure.md#test-controller) to do this.

```text
t.select( init [, options] )
```

Parameter              | Type     | Description
---------------------- | -------- | ------------------------------------------------------------------
`init`                 | Function &#124; String &#124; Selector &#124; Snapshot &#124; Promise | Identifies a DOM node to be selected. See [Selector Initializers](#selector-initializers).
`options` *(optional)* | Object   | See [Options](selector-options.md).

The following example shows how to get a DOM element by ID with `t.select`.

```js
fixture `My fixture`
    .page('http://www.example.com/');

test('My Test', async t => {
    const header = await t.select(() => document.getElementById('header'));
});
```

## Return Values. DOM Node Snapshots

When you return a DOM node from the selector, what actually returns from the client
is a *DOM node snapshot* - an object that reflects the state of the DOM node.

```js
import { expect } from 'chai';
import { Selector } from 'testcafe';

const getElementById = Selector(id => document.getElementById(id));

fixture `My fixture`
    .page('http://www.example.com/');

test('Login field height', async t => {
    const loginInput = await getElementById('login');

    expect(loginInput.width).to.equal(35);
});
```

For a list of members exposed by DOM node snapshots, see [DOM Node Snapshots](dom-node-snapshots.md).

## Using Selectors to Define Action Targets

You can pass selectors to [test actions](../actions/index.md) to use the returned element as the action target.

```js
import { Selector } from 'testcafe';

fixture `My fixture`
    .page('http://www.example.com/');

const getLastItem = Selector(() => document.querySelector('.toc-item:last-child'));

test('My Test', async t => {
    await t.click(getLastItem);
});
```

In this instance, the selector will be called with no arguments.

You can also pass a promise returned by a selector if you need to call it with arguments.

```js
import { Selector } from 'testcafe';

const getElementById = Selector(id => document.getElementById(id));

fixture `My fixture`
    .page('http://www.example.com/');

test('My Test', async t => {
    await t.click(getElementById('submit-button'));
});
```

DOM element snapshots can also be passed to test actions.

```js
import { Selector } from 'testcafe';

const getElementById = Selector(id => document.getElementById(id));

fixture `My fixture`
    .page('http://www.example.com/');

test('My Test', async t => {
    const topMenuSnapshot = await getElementById('top-menu');

    await t.click(topMenuSnapshot);
});
```

In this instance, the selector that was used to fetch this snapshot will be called once again.

When a selector, its promise or DOM element snapshot is passed to an action, TestCafe waits for the target element to appear
in the DOM and become visible before this action is executed. If this does not happen
within the selector timeout, which is specified in test code by using the [timeout](selector-options.md#optionstimeout) option
or when launching tests via [API](../../using-testcafe/programming-interface/runner.md#run)
or [CLI](../../using-testcafe/command-line-interface.md#--selector-timeout-ms), the test fails.

## Calling Selectors from Node.js Callbacks

Selectors need access to the [test controller](../test-code-structure.md#test-controller) to be executed.
When called right from the test function, they implicitly obtain the test controller.

However, if you need to call a selector from a Node.js callback that fires during the test run,
you will have to manually bind it to the test controller.

Use the [boundTestRun](selector-options.md#optionsboundtestrun) option for this.

```js
import { http } from 'http';
import { expect } from 'chai';
import { Selector } from 'testcafe';

fixture `My fixture`
    .page('http://www.example.com/');

const getElementById = Selector(id => document.getElementById(id));

test('Title changed', async t => {
    const boundSelector = getElementById.with({ boundTestRun: t });

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