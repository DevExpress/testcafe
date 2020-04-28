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

* A [selector](/testcafe/documentation/guides/basic-guides/select-page-elements.html).

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

* A [DOM node snapshot](/testcafe/documentation/guides/basic-guides/select-page-elements.html#dom-node-snapshot).

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

* A Promise returned by a [selector](/testcafe/documentation/guides/basic-guides/select-page-elements.html).

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
within the [selector timeout](/testcafe/documentation/guides/basic-guides/select-page-elements.html#selector-timeout), the test fails.

Note that TestCafe cannot interact with page elements under other elements.
If the target element is not on top when an action is triggered, TestCafe waits for this element to appear in the foreground.
If this does not happen within the [selector timeout](/testcafe/documentation/guides/basic-guides/select-page-elements.html#selector-timeout),
the action is performed with an overlaying element. For information on why the target element can be overlaid,
see the *stacking* description in the [z-index](https://developer.mozilla.org/en-US/docs/Web/CSS/z-index) topic.

> [Upload action](/testcafe/documentation/guides/basic-guides/interact-with-the-page.html#upload-files) is the only method that does not require the target `input` to be visible.
> You can also perform the upload action when the `input` is overlaid.
