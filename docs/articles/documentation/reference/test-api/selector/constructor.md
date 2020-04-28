---
layout: docs
title: Selector constructor
permalink: /documentation/reference/test-api/selector/constructor.html
---
# Selector constructor

Creates a [selector](../../../guides/basic-guides/select-page-elements.md).

```text
Selector( init [, options] )
```

Parameter              | Type     | Description
---------------------- | -------- | -------------------------------------------------------------------------------
`init`                 | Function &#124; String &#124; Selector &#124; Snapshot &#124; Promise | Identifies a DOM node to be selected. See [Initialize Selectors](#initialize-selectors).
`options`&#160;*(optional)* | Object   | See [Selector Options](#options).

The following example creates a selector from a CSS string for an element with ID `username`:

```js
import { Selector } from 'testcafe';

const usernameInput = Selector('#username');
```

## Initialize Selectors

You can initialize a selector with any of these objects.

* A CSS selector string that matches one or several nodes.

    ```js
    import { Selector } from 'testcafe';

    // A selector is created from a CSS selector string.
    const submitButton = Selector('#submit-button');
    ```

* A regular function executed on the client side. This function must return a DOM node, an array of DOM nodes,
  `NodeList`, `HTMLCollection`, `null` or `undefined`.

    ```js
    import { Selector } from 'testcafe';

    // A selector is created from a regular function.
    // This selector will take an element by id that is saved in the localStorage.
    const element = Selector(() => {
        const storedElementId = window.localStorage.storedElementId;

        return document.getElementById(storedElementId);
    });
    ```

    You can provide a function that takes arguments, and then pass serializable objects to the selector when you call it.

    ```js
    import { Selector } from 'testcafe';

    const elementWithId = Selector(id => {
        return document.getElementById(id);
    });

    fixture `My fixture`
        .page `http://www.example.com/`;

    test('My Test', async t => {
        await t.click(elementWithId('buy'));
    });
    ```

    If the function should always use the same argument value, you can assign it to the [options.dependencies](#optionsdependencies) property when the selector is created.

* A selector.

    ```js
    import { Selector } from 'testcafe';

    // This selector is created from a CSS selector
    // that matches all elements of a specified class.
    const ctaButton = Selector('.cta-button');

    // This selector is created based on the previous selector and inherits
    // its initializer, but overwrites the `visibilityCheck` parameter.
    Selector(ctaButton, { visibilityCheck: true });
    ```

* A [DOM Node Snapshot](../domnodestate.md) returned by selector execution.

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

{% include selectors/selector-options.md %}
