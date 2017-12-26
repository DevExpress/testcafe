---
layout: docs
title: Actions
permalink: /documentation/test-api/actions/
checked: true
---
# Actions

Test API provides a set of *actions* that enable you to interact with the webpage.

Actions are implemented as methods in the [test controller](../test-code-structure.md#test-controller) object. You can call them in a chained fashion.

The following sample types text into an input and clicks a button by using the `t.typeText` and `t.click` actions.

```js
fixture `My fixture`
    .page `http://www.example.com/`;

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

For actions that target DOM elements, use the `selector` parameter to identify the desired element.

You can pass any of the following objects as a `selector`.

* A CSS selector string.

    ```js
    test('My Test', async t => {

        // Click will be performed on the first element
        // that matches the CSS selector.
        await t.click('#submit-button');
    });
    ```

* A [selector](../selecting-page-elements/selectors/README.md).

    ```js
    import { Selector } from 'testcafe';

    fixture `My fixture`
        .page `http://www.example.com/`;

    const lastItem = Selector('.toc-item:last-child');

    test('My Test', async t => {

        // Click will be performed on the element selected by
        // the 'getLastItem' selector.
        await t.click(lastItem);
    });
    ```

* A client-side function that returns a DOM element.

    ```js
    test('My Test', async t => {

        // Click will be performed on the element returned by the function,
        // which is the third child of the document's body.
        await t.click(() => document.body.children[2]);
    });
    ```

* A [DOM node snapshot](../selecting-page-elements/selectors/using-selectors.md#dom-node-snapshot).

    ```js
    import { Selector } from 'testcafe';

    fixture `My fixture`
        .page `http://www.example.com/`;

    test('My Test', async t => {
        const topMenuSnapshot = await Selector('#top-menu');

        // Click will be performed on the element whose snapshot
        // is specified. This is an element with the '#top-menu' ID.
        await t.click(topMenuSnapshot);
    });
    ```

* A Promise returned by a [selector](../selecting-page-elements/selectors/README.md).

    ```js
    import { Selector } from 'testcafe';

    const submitButton = Selector('#submit-button');

    fixture `My fixture`
        .page `http://www.example.com/`;

    test('My Test', async t => {

        // Click will be performed on the element specified by the selector
        // as soon as the promise is resolved.
        await t.click(submitButton());
    });
    ```

Before executing an action, TestCafe waits for the target element to appear
in the DOM and become visible. If this does not happen
within the [selector timeout](../selecting-page-elements/selectors/using-selectors.md#selector-timeout), the test fails.

## Remarks for Touch Devices

On touch devices, TestCafe emulates touch events instead of mouse events.

Mouse event | Touch event
----------- | -------------
`mousemove` (when hovering or dragging) | `touchmove` (dragging only)
`mousedown` | `touchstart`
`mouseup`   | `touchend`