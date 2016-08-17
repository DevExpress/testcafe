---
layout: docs
title: Actions
permalink: /documentation/test-api/actions/
---
# Actions

Test API provides a set of *actions* that enable you to interact with the webpage.

Test actions are implemented as methods in the [test controller](../test-code-structure.md#test-controller) object. You can call them in a chained fashion.

The following sample types text into an input and clicks a button by using the `t.typeText` and `t.click` actions.

```js
fixture `My fixture`
    .page('http://www.example.com/');

test('MyTest', async t => {
    await t
        .typeText('#input', 'Hello world!')
        .click('#apply');
});
```

For details about a specific action, see the corresponding topic.

* [Click](click.md)
* [Right Click](right-click.md)
* [Double Click](double-click.md)
* [Drag Element](drag-element.md)
* [Hover](hover.md)
* [Take Screenshot](take-screenshot.md)
* [Navigate](navigate.md)
* [Press Key](press-key.md)
* [Select Text](select-text.md)
* [Type Text](type-text.md)
* [Upload](upload.md)
* [Resize Window](resize-window.md)

## Selecting Target Elements

For test actions that target a specific DOM element, use the `selector` parameter to identify the desired element.

You can pass one of the following as a `selector`.

* Function that returns a DOM element.

    ```js
    test('My Test', async t => {

        // Click will be performed on an element returned by the function,
        // that is the sixth element of the 'active' class.
        await t.click(() => document.getElementsByClassName('active')[5]));
    });
    ```

* CSS selector string.

    ```js
    test('My Test', async t => {

        // Click will be performed on the first element
        // that matches the CSS selector.
        await t.click('#submit-button');
    });
    ```

* [Selector](../selecting-page-elements/selectors.md).

    ```js
    import { Selector } from 'testcafe';

    fixture `My fixture`
        .page('http://www.example.com/');

    const getLastItem = Selector(() => document.querySelector('.toc-item:last-child'));

    test('My Test', async t => {

        // Click will be performed on an element selected by
        // the 'getLastItem' selector.
        await t.click(getLastItem);
    });
    ```

* [DOM node snapshot](../selecting-page-elements/selectors.md#return-values-dom-node-snapshots).

    ```js
    import { Selector } from 'testcafe';

    const getElementById = Selector(id => document.getElementById(id));

    fixture `My fixture`
        .page('http://www.example.com/');

    test('My Test', async t => {
        const topMenuSnapshot = await getElementById('top-menu');

        // Click will be performed on the element whose snapshot
        // is specified. This is an element with the '#top-menu' ID.
        await t.click(topMenuSnapshot);
    });
    ```

* Promise returned by a [selector](../selecting-page-elements/selectors.md).

    ```js
    import { Selector } from 'testcafe';

    const getElementById = Selector(id => document.getElementById(id));

    fixture `My fixture`
        .page('http://www.example.com/');

    test('My Test', async t => {

        // Click will be performed on an element selected by
        // the 'getElementById' selector as soon as the promise
        // is resolved.
        await t.click(getElementById('submit-button'));
    });
    ```
