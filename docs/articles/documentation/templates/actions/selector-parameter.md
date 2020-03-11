## Select Target Elements

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

* A [selector](../../guides/basic-guides/select-page-elements.md).

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

* A [DOM node snapshot](../../guides/basic-guides/select-page-elements.md#dom-node-snapshot).

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

* A Promise returned by a [selector](../../guides/basic-guides/select-page-elements.md).

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
within the [selector timeout](../../guides/basic-guides/select-page-elements.md#selector-timeout), the test fails.

Note that TestCafe cannot interact with page elements overlaid by a different element.
If the target element is not on top when an action is triggered, TestCafe waits for this element to appear in the foreground.
If this does not happen within the [selector timeout](select-page-elements.md#selector-timeout),
the action is performed with an overlaying element. To learn why the target element can be overlaid,
see the *stacking* description in the [z-index](https://developer.mozilla.org/en-US/docs/Web/CSS/z-index) topic.

> An exception is the [Upload action](../../reference/test-api/testcontroller/upload.md). It does not require the target `input` to be visible.
> You can also perform the upload action when the `input` is overlaid.
