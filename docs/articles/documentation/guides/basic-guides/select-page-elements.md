---
layout: docs
title: Select Page Elements
permalink: /documentation/guides/basic-guides/select-page-elements.html
---
# Select Page Elements

TestCafe needs to identify the target page element to perform an [action](interact-with-the-page.md) with it (click, drag, etc.) or obtain its state and check it in an [assertion](assert.md).

You can pass a CSS selector to an action function to specify the target element:

```js
await t.click('#my-button');
```

For more complex queries, however, CSS selectors get longer and difficult to read, write, and maintain:

```js
await t.click('div > .my-class > div:nth-child(2) > span > a[href="https://my-site.com/page"]');
```

CSS selectors are also not capable of quering parent elements:

```html
<html>
    <body>
        <!-- ... -->
                    <div>
                        <!-- you cannot query this div by its child's ID -->
                        <div>
                            <div id="query-my-parent"></div>
                        </div>
                    </div>
        <!-- ... -->
    </body>
</html>
```

To address these limitations, TestCafe introduces selector functions (or simply *selectors*).

TestCafe selectors lay out in method chains and provide API to traverse through the DOM tree in jQuery style:

```js
const link = Selector('div')
    .child('.my-class')
    .child('div')
    .nth(2)
    .child('span')
    .child('a')
    .withAttribute('href', 'https://my-site.com/page');

const parent = Selector('#query-my-parent').parent();
```

You can use selectors to [inspect elements](#obtain-element-state), define [action targets](#define-action-targets) and [assertion actual values](#define-assertion-actual-value).

> Important! Do not modify the tested webpage within selectors.
> To interact with the page, use [test actions](interact-with-the-page.md).

## Create Selectors

Pass a CSS selector string or a client-side function to the [Selector](../../reference/test-api/selector/selector.md) constructor to create a selector.

```js
import { Selector } from 'testcafe';

const article = Selector('#article-content');
// or
const article = Selector(() => {
    return document.getElementById('article-content');
});
```

In this example, the `article` selector identifies an element with the `article-content` ID.

You can continue the selector chain to filter elements returned by the previous selector or traverse through the DOM tree:

```js
import { Selector } from 'testcafe';

const seeMore = Selector('#article-content')
    .child('div')
    .withText('See more');
```

This selector does the following:

  1. Selects an element with the `article-content` ID.
  2. Selects its child elements.
  3. Filters them by the `<div>` tag name.
  4. Selects elements with text `See more` among them.

```html
<html>
    <body>
        <div id="article-content">
            <p>A paragraph</p>
            <div>A block</div>
            <!-- This div is selected -->
            <div>See more</div>
        </div>
    </body>
</html>
```

If a selector matches multiple elements, the subsequent methods return results for all the elements. For instance, the following selector returns all children of all `<div>` tags on the page:

```js
const sel = Selector('div').child();
```

```html
<html>
    <body>
        <div>
            <div>This element is selected.</div>
            <p>This element is also selected.</p>
            <div>
                This div is selected as well.
                <p>And even this paragraph is included.</p>
            </div>
        </div>
    </body>
</html>
```

### Member Tables

Methods that filter elements returned by the selector:

Method                                                              | Description
------------------------------------------------------------------- | -------------
[nth](../../reference/test-api/selector/nth.md)                     | Finds an element by its index.
[withText](../../reference/test-api/selector/withtext.md)           | Finds an element whose content includes the specified text.
[withExactText](../../reference/test-api/selector/withexacttext.md) | Finds an element with the specified text.
[withAttribute](../../reference/test-api/selector/withattribute.md) | Finds an element with the specified attribute or attribute value.
[filterVisible](../../reference/test-api/selector/filtervisible.md) | Selects visible elements.
[filterHidden](../../reference/test-api/selector/filterhidden.md)   | Selects hidden elements.
[filter](../../reference/test-api/selector/filter.md)               | Finds elements that match the specified CSS selector or predicate.

Methods that search for DOM elements relatively to the selected element:

Method                                                              | Description
------------------------------------------------------------------- | -------------
[find](../../reference/test-api/selector/find.md)                   | Finds a descendant node that matches the specified CSS selector or predicate.
[parent](../../reference/test-api/selector/parent.md)               | Selects parent elements.
[child](../../reference/test-api/selector/child.md)                 | Selects child elements.
[sibling](../../reference/test-api/selector/sibling.md)             | Selects sibling elements.
[nextSibling](../../reference/test-api/selector/nextsibling.md)     | Selects succeeding sibling elements.
[prevSibling](../../reference/test-api/selector/prevsibling.md)     | Selects preceding sibling elements.

## Use Selectors

### Check if an Element Exists

Selectors can match a single DOM element on the page, multiple elements or nothing. Use the following properties to check whether matching elements exist and determine their number.

Property | Type | Description
------ | ----- | -----
[exists](../../reference/test-api/selector/exists.md) | Boolean | `true` if at least one matching element exists.
[count](../../reference/test-api/selector/count.md) | Number | The number of matching elements.

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

### Obtain Element State

Selectors and promises returned by selectors expose API that allows you to obtain the state (size, position, classes, etc.) of the matching element.

```js
const headerText = await Selector('#header').textContent;
```

See the API reference in [DOMNodeState](../../reference/test-api/domnodestate.md).

The API is asynchronous. Use `await` before methods and properties.

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

#### DOM Node Snapshot

If you need to use an object's state multiple times in the test, you may want to get the object that contains [all the data](../../reference/test-api/domnodestate.md) in one turnaround to the client. To obtain this object (*DOM Node Snapshot*), call the selector with the `await` keyword:

```js
import { Selector } from 'testcafe';

fixture `My fixture`
    .page `http://devexpress.github.io/testcafe/example/`;

test('DOM Node Snapshot', async t => {
    const sliderHandle         = Selector('#slider').child('span');
    const sliderHandleSnapshot = await sliderHandle();

    console.log(sliderHandleSnapshot.hasClass('ui-slider-handle'));    // => true
    console.log(sliderHandleSnapshot.childElementCount);               // => 0
});
```

Note that if a selector matches several DOM nodes on the page, this asynchronous call returns the first node from the matched set.

> TestCafe wait mechanisms do not work when you pass a snapshot's property to an [assertion](assert.md). To enable [Smart Assertion Query]assert.md#smart-assertion-query-mechanism), pass [selector's properties](../../reference/test-api/domnodestate.md#members-common-across-all-nodes) instead.

### Define Action Targets

You can pass selectors to [test actions](interact-with-the-page.md) to specify the action's target element.

```js
import { Selector } from 'testcafe';

fixture `My fixture`
    .page `http://devexpress.github.io/testcafe/example/`;

const label = Selector('#tried-section').child('label');

test('My Test', async t => {
    await t.click(label);
});
```

If the selector matches multiple DOM nodes, the action is executed for the first node.

Before an action is performed, TestCafe waits for the target element to appear in the DOM and become visible. If this does not happen
within the [selector timeout](#selector-timeout), the test fails.

You can also pass DOM element snapshots to test actions.

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

In this instance, the selector that fetched this snapshot is re-executed before the action.

### Define Assertion Actual Value

You can pass a selector property to an [assertion](assert.md) to check whether the DOM node has the expected state.

```js
import { Selector } from 'testcafe';

fixture `My fixture`
    .page `http://devexpress.github.io/testcafe/example/`;

test('Assertion with Selector', async t => {
    const developerNameInput = Selector('#developer-name');

    await t
        .expect(developerNameInput.value).eql('')
        .typeText(developerNameInput, 'Peter')
        .expect(developerNameInput.value).eql('Peter');
});
```

When you pass selector properties instead of values, TestCafe enables [Smart Assertion Query Mechanism](assert.md#smart-assertion-query-mechanism) to avoid accidental errors and unstable tests. In this example, the assertion does not fail immediately if the condition does not match. TestCafe recalculates the `developerNameInput.value` property value until the assertion passes or the timeout expires.

### Selector Timeout

When a selector is executed, TestCafe waits for the target node to appear in the DOM until the *selector timeout* expires.

Use the [timeout](../../reference/selector.md#optionstimeout) option to specify the selector timeout in test code. To set the timeout when you launch tests, pass it to the [runner.run](../../reference/testcafe-api/runner.md#run) API method or the [--selector-timeout](../../reference/command-line-interface.md#--selector-timeout-ms) command line option.

During the timeout, the selector is re-executed until it returns a DOM node or the timeout exceeds. If TestCafe cannot find the corresponding node in the DOM, the test fails.

> Note that you can specify that the node returned by the selector should also be visible. To do this, use the [visibilityCheck](../../reference/selector.md#optionsvisibilitycheck) option.

### Debug Selectors

TestCafe outputs information about failed selectors to test run reports.

When you try to use a selector that does not match any DOM element, the test fails and an error is thrown. The error message indicates which selector has failed.

An error can also occur when you call [selector's methods](#member-tables) in a chain. These methods are applied to the selector one by one. TestCafe detects a method after which the selector no longer matches any DOM element. This method is highlighted in the error message.

![Selector methods in a report](../../../../images/failed-selector-report.png)

### Extend Selectors with Custom Properties and Methods

You can add custom properties and methods to TestCafe selectors. Custom members allow you to implement framework-specific API and retrieve DOM element properties not included in standard selectors.

To add a custom member, provide client-side code for the method or property getter with the [addCustomMethods](../../reference/test-api/selector/addcustommethods.md) or [addCustomDOMProperties](../../reference/test-api/selector/addcustomdomproperties.md) method.

```js
import { Selector } from 'testcafe';

fixture `My fixture`
    .page `https://devexpress.github.io/testcafe/example/`;

test('Check Label HTML', async t => {
    let fieldSet = Selector('fieldset').addCustomMethods({
        getLabel: (el, idx) => {
            return el[0].elements[idx].labels[0];
        }
    }, {
        returnDOMNodes: true
    });

    await t.expect(fieldSet.nth(1).getLabel(3).textContent).eql('Easy embedding into a Continuous integration system');

    fieldSet = fieldSet.addCustomDOMProperties({
        legend: el => el.querySelector('legend').innerText
    });

    await t.expect(fieldSet.nth(1).legend).eql('Which features are important to you:');
});
```

Note that custom properties and methods propagate through the selector chain. For instance, you can define `selector.myProperty` and access it further in the chain: `selector.nth(2).myProperty`, `selector.withText('ABC').myProperty`, etc.

### Overwrite Options

You can use the selector's [with](../../reference/test-api/selector/with.md) method to overwrite its [options](../../reference/test-api/selector/with.md#options). This allows you to derive selectors with different settings from the same base selector.

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