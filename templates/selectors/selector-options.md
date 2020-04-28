## Options

### options.boundTestRun

**Type**: Object

If you need to call a selector from a Node.js callback, assign the current [test controller](/testcafe/documentation/reference/test-api/testcontroller/) to the `boundTestRun` option.

For more information, see [Calling Selectors from Node.js Callbacks](/testcafe/documentation/guides/basic-guides/select-page-elements.html#call-selectors-from-nodejs-callbacks).

### options.dependencies

**Type**: Object

Use this option to pass functions, variables or objects to selectors [initialized with a function](/testcafe/documentation/guides/basic-guides/select-page-elements.html#create-selectors). The `dependencies` object's properties are added to the function's scope as variables.

Use `dependencies` instead of the function's arguments if you do not need to pass new values every time you call the selector.

The following sample demonstrates a selector (`element`) that uses a server-side object passed as a dependency (`customId`) to obtain a page element.

```js
import { Selector } from 'testcafe';

const persistentId = { key: 'value' };

const element = Selector(() => {
    return getElementByCustomId(persistentId);
}, {
    dependencies: { persistentId }
});

fixture `My fixture`
    .page `http://www.example.com/`;

test('My Test', async t => {
    await t.click(element);
});
```

### options.timeout

**Type**: Number

The time (in milliseconds) allowed for an element returned by the selector to appear in the DOM before the test fails.

If the [visibilityCheck](#optionsvisibilitycheck) option is enabled, the element then must become visible within the `timeout`.

**Default value**: the timeout specified in the [runner.run](/testcafe/documentation/reference/testcafe-api/runner/run.html) API method or the [--selector-timeout](/testcafe/documentation/reference/command-line-interface.html#--selector-timeout-ms) command line option.

### options.visibilityCheck

**Type**: Boolean

`true` to additionally require the returned element to become visible within [options.timeout](#optionstimeout).

This option is in effect when TestCafe waits for the selector to return a page element. This includes situations when

* a property is obtained from the selector;

    ```js
    const width = await Selector('#element', { visibilityCheck: true }).clientWidth;
    ```

* a selector property is passed to an [assertion](/testcafe/documentation/guides/basic-guides/assert.html) as its actual value;

    ```js
    await t.expect(Selector('#element', { visibilityCheck: true }).clientWidth).eql(400);
    ```

* a selector is evaluated with the `await` keyword;

    ```js
    const snapshot = await Selector('#element', { visibilityCheck: true })();
    ```

If the target element is not visible, the selector throws an exception.

Note that when a selector is passed to a [test action](/testcafe/documentation/guides/basic-guides/interact-with-the-page.html) as the target element's identifier, the target element should be visible regardless of the `visibilityCheck` option.

Unlike filter functions, the `visibilityCheck` option does not change the selector's matched set.

Consider the following page:

```html
<html>
  <body>
    <div>This div is visible</div>
    <div style="display:none">This div not is visible</div>
    <div style="visibility:hidden">This div not is visible either</div>
  </body>
</html>
```

When you use a selector with `visibilityCheck` enabled to determine if an element exists or to count matching elements, TestCafe also takes into account invisible elements.

```js
const count = await Selector('div', { visibilityCheck: true }).count;

// returns 3 since the visibilityCheck option
// does not affect the selector's matched set
```

To filter page elements by their visibility, use [filterVisible](/testcafe/documentation/reference/test-api/selector/filtervisible.html) and [filterHidden](/testcafe/documentation/reference/test-api/selector/filterhidden.html) methods.

**Default value**: `false`
