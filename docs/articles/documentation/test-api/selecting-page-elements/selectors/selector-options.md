---
layout: docs
title: Selector Options
permalink: /documentation/test-api/selecting-page-elements/selectors/selector-options.html
checked: true
---
# Selector Options

You can pass the following options to the [Selector constructor](creating-selectors.md).

* [options.boundTestRun](#optionsboundtestrun)
* [options.timeout](#optionstimeout)
* [options.visibilityCheck](#optionsvisibilitycheck)

You can also overwrite the options you have specified before.

* [Overwriting Options](#overwriting-options)

## options.boundTestRun

**Type**: Object

If you need to call a selector from a Node.js callback, assign the current
[test controller](../../test-code-structure.md#test-controller) to the `boundTestRun` option.

For details, see [Calling Selectors from Node.js Callbacks](edge-cases-and-limitations.md#calling-selectors-from-nodejs-callbacks).

## options.timeout

**Type**: Number

The amount of time, in milliseconds, allowed for an element returned by the selector to appear in the DOM before the test fails.

If the [visibilityCheck](#optionsvisibilitycheck) option is enabled, the element then must become visible within the `timeout`.

**Default value**: timeout specified by using the [runner.run](../../../using-testcafe/programming-interface/runner.md#run) API method
or the [selector-timeout](../../../using-testcafe/command-line-interface.md#--selector-timeout-ms) command line option.

## options.visibilityCheck

**Type**: Boolean

`true` to additionally require the returned element to become visible within [options.timeout](#optionstimeout).

This option is in effect when TestCafe waits for the selector to return a page element. This includes situations when

* a property is obtained from the selector;

    ```js
    const width = await Selector('#element', { visibilityCheck: true }).clientWidth;
    ```

* a selector property is passed to an [assertion](../../assertions/README.md) as its actual value;

    ```js
    await t.expect(Selector('#element', { visibilityCheck: true }).clientWidth).eql(400);
    ```

* a selector is evaluated using the `await` keyword;

    ```js
    const snapshot = await Selector('#element', { visibilityCheck: true })();
    ```

If the target element is not visible, the selector throws an exception in all these cases.

Note that when a selector is passed to a [test action](../../actions/README.md) as an identifier for the target element,
TestCafe [requires](../../waiting-for-page-elements-to-appear.md#waiting-for-action-target-elements) that the target element is visible regardless of the `visibilityCheck` option.

Unlike filter functions, the `visibilityCheck` option does not change the matching set of the selector.

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

When a selector with `visibilitycheck` enabled is tested for an element existance
or the number of matching elements, invisible elements also count.

```js
const count = await Selector('div', { visibilityCheck: true }).count;

// returns 3 since the visibilityCheck option
// does not affect the selector's matching set
```

In case you need to filter page elements by their visibility,
use [filterVisible](functional-style-selectors.md#filtervisible) and
[filterHidden](functional-style-selectors.md#filterhidden) methods.

**Default value**: `false`

## Overwriting Options

You can overwrite selector options by using the selector's `with` function.

```text
selector.with( options ) → Selector
```

`with` returns a new selector with a different set of options that includes options
from the original selector and new `options` that overwrite the original ones.

The sample below shows how to overwrite the selector options so that it waits for the selected element to become visible.

```js
import { Selector } from 'testcafe';

const elementWithId = Selector(id => document.getElementById(id));

fixture `My fixture`
    .page `http://www.example.com/`;

test('My Test', async t => {
    const visibleElementWithId = elementWithId.with({
        visibilityCheck: true
    });

    const visibleButton = await visibleElementWithId('submit-button');
});
```
