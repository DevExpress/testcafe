---
layout: docs
title: Creating Selectors
permalink: /documentation/test-api/selecting-page-elements/selectors/creating-selectors.html
checked: false
---
# Creating Selectors

To create a selector, use the `Selector` constructor.

```text
Selector( init [, options] )
```

Parameter              | Type     | Description
---------------------- | -------- | -------------------------------------------------------------------------------
`init`                 | Function &#124; String &#124; Selector &#124; Snapshot &#124; Promise | Identifies a DOM node to be selected. See [Initializing Selectors](#initializing-selectors).
`options`&#160;*(optional)* | Object   | See [Selector Options](selector-options.md).

The following example creates a selector from a CSS string for an element with ID `username`.

```js
import { Selector } from 'testcafe';

const usernameInput = Selector('#username');
```

## Initializing Selectors

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
    // This selector will take an element by id that is saved in the localStorage.
    const element = Selector(() => {
        const storedElementId = window.localStorage.storedElementId;

        return document.querySelector(storedElementId);
    });
    ```

* A selector.

    ```js
    import { Selector } from 'testcafe';

    // This selector is created from a function that returns all elements of a specified class.
    const cta-button = Selector('.cta-button');

    // This selector is created based on the previous selector and inherits
    // its initializer, but overwrites the `visibilityCheck` parameter.
    Selector(cta-button, { visibilityCheck: true });
    ```

* A [DOM Node Snapshot](using-selectors.md#dom-node-snapshot) returned by selector execution.

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