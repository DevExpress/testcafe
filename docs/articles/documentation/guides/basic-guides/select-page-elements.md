---
layout: docs
title: Select Page Elements
permalink: /documentation/guides/basic-guides/select-page-elements.html
redirect_from:
  - /documentation/test-api/selecting-page-elements/
  - /documentation/test-api/selecting-page-elements/examples-of-working-with-dom-elements.html
  - /documentation/test-api/selecting-page-elements/framework-specific-selectors.html
  - /documentation/test-api/selecting-page-elements/selectors/
  - /documentation/test-api/selecting-page-elements/selectors/creating-selectors.html
  - /documentation/test-api/selecting-page-elements/selectors/edge-cases-and-limitations.html
  - /documentation/test-api/selecting-page-elements/selectors/extending-selectors.html
  - /documentation/test-api/selecting-page-elements/selectors/functional-style-selectors.html
  - /documentation/test-api/selecting-page-elements/selectors/selector-options.html
  - /documentation/test-api/selecting-page-elements/selector-options.html
  - /documentation/test-api/selecting-page-elements/selectors/using-selectors.html
  - /documentation/test-api/selecting-page-elements/selectors.html
---
# Select Page Elements

You should identify the target page element to perform an [action](interact-with-the-page.md) with it (click, drag, etc.) or check its state in an [assertion](assert.md).

You can pass a CSS selector to an action to specify the target element:

```js
await t.click('#my-button');
```

For more complex queries, however, CSS selectors get longer and difficult to read, write, and maintain:

```js
await t.click('div > .my-class > div:nth-child(2) > span > a[href="https://my-site.com/page"]');
```

CSS selectors cannot query parent elements:

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

TestCafe's chainable [Selector](../../reference/test-api/selector/README.md) functions expose methods used to traverse through the DOM tree in jQuery style. The following example illustrates how to overcome CSS limitations with TestCafe selectors:

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

You can use selectors to [inspect elements](#obtain-element-state), define [action targets](#define-action-targets), and [assertion actual values](#define-assertion-actual-value).

* [Create Selectors](#create-selectors)
* [Member Tables](#member-tables)
* [Use Selectors](#use-selectors)
  * [Check if an Element Exists](#check-if-an-element-exists)
  * [Obtain Element State](#obtain-element-state)
    * [DOM Node Snapshot](#dom-node-snapshot)
  * [Define Action Targets](#define-action-targets)
  * [Define Assertion Actual Value](#define-assertion-actual-value)
* [Selector Timeout](#selector-timeout)
* [Debug Selectors](#debug-selectors)
* [Extend Selectors with Custom Properties and Methods](#extend-selectors-with-custom-properties-and-methods)
* [Overwrite Options](#overwrite-options)
* [Framework-Specific Selectors](#framework-specific-selectors)
  * [React](#react)
  * [Angular](#angular)
  * [AngularJS](#angularjs)
  * [Vue](#vue)
  * [Aurelia](#aurelia)
* [Call Selectors from Node.js Callbacks](#call-selectors-from-nodejs-callbacks)
* [Limitations](#limitations)
* [Examples](#examples)

> Important! Do not modify the tested webpage within selectors.
> To interact with the page, use [test actions](interact-with-the-page.md).

## Create Selectors

Pass a CSS selector string or a client-side function to the [Selector](../../reference/test-api/selector/constructor.md) constructor to create a selector.

```js
import { Selector } from 'testcafe';

const article = Selector('#article-content');
// or
const article = Selector(() => {
    return document.getElementById('article-content');
});
```

In this example, the `article` selector identifies an element with the `article-content` ID.

You can continue the selector chain to filter elements from the previous selector or traverse through the DOM tree:

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

If a selector matches multiple elements, the subsequent methods return results for all the elements. For instance, the following selector returns the child nodes of all `<div>` tags on the page:

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

## Member Tables

The following methods filter elements from the selector:

Method                                                              | Description
------------------------------------------------------------------- | -------------
[nth](../../reference/test-api/selector/nth.md)                     | Finds an element by its index.
[withText](../../reference/test-api/selector/withtext.md)           | Finds an element whose content includes the specified text.
[withExactText](../../reference/test-api/selector/withexacttext.md) | Finds an element with the specified text.
[withAttribute](../../reference/test-api/selector/withattribute.md) | Finds an element with the specified attribute or attribute value.
[filterVisible](../../reference/test-api/selector/filtervisible.md) | Selects visible elements.
[filterHidden](../../reference/test-api/selector/filterhidden.md)   | Selects hidden elements.
[filter](../../reference/test-api/selector/filter.md)               | Finds elements that match the specified CSS selector or predicate.

Methods that search for DOM elements relative to the selected element:

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

Selectors can match a single DOM element on the page, multiple elements, or nothing. Use the following properties to check if elements match and the number of matching elements:

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

Selectors and promises (returned by selectors) expose API that allows you to obtain the matching element's state (size, position, classes, etc.).

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

To use an object's state multiple times in the test, get the object that contains [all the data](../../reference/test-api/domnodestate.md) in one turnaround to the client. To obtain this object (*DOM Node Snapshot*), call the selector with the `await` keyword:

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

Note that if a selector matches several DOM nodes on the page, this asynchronous call returns the first matching node.

> TestCafe wait mechanisms do not work when you pass a snapshot's property to an [assertion](assert.md). To enable [Smart Assertion Query](assert.md#smart-assertion-query-mechanism), pass [selector's properties](../../reference/test-api/domnodestate.md#members-common-across-all-nodes) instead.

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

Before an action is performed, TestCafe waits for the target element to be in the DOM and become visible. If this does not happen within the [selector timeout](#selector-timeout), the test fails.

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

When you pass selector properties instead of values, TestCafe enables [Smart Assertion Query Mechanism](assert.md#smart-assertion-query-mechanism) to avoid errors and unstable tests. In this example, the assertion does not fail immediately if the condition does not match - TestCafe recalculates the `developerNameInput.value` property value until the assertion passes or the timeout expires.

## Selector Timeout

When a selector is executed, TestCafe waits for the target node to appear in the DOM until the *selector timeout* expires.

Use the [timeout](../../reference/test-api/selector/constructor.md#optionstimeout) option to specify the selector timeout in test code. To set the timeout when you launch tests, pass it to the [runner.run](../../reference/testcafe-api/runner/run.md) API method or the [--selector-timeout](../../reference/command-line-interface.md#--selector-timeout-ms) command line option.

During the timeout, the selector is re-executed until it returns a DOM node or the timeout is exceeded. If TestCafe cannot find the corresponding node in the DOM, the test fails.

> Note that you can specify that the node returned by the selector should also be visible. To do this, use the [visibilityCheck](../../reference/test-api/selector/constructor.md#optionsvisibilitycheck) option.

## Debug Selectors

TestCafe outputs information about failed selectors to test run reports.

When you try to use a selector that does not match any DOM element, the test fails and an error is thrown. The error message indicates which selector has failed.

An error can also occur when you call a [selector's methods](#member-tables) in a chain. These methods are applied to the selector one by one. TestCafe detects the first method that returns no elements and highlights it in the error message.

![Selector methods in a report](../../../images/failed-selector-report.png)

## Extend Selectors with Custom Properties and Methods

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

## Overwrite Options

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

## Framework-Specific Selectors

TestCafe selector functions are based on CSS selectors or client JS code, which is suitable for HTML5 websites. However, if you use a front-end framework, selectors based on framework-specific entities can improve locating elements. For instance, use the component tree for React or element bindings for Aurelia.

For this purpose, the TestCafe team and community have developed libraries of dedicated selectors for the most popular frameworks.

### React

The React selectors module provides the `ReactSelector` class that allows you to select DOM elements by the component name. You can get a root element or search through the nested components or elements. In addition, you can obtain the component props and state.

```js
import { ReactSelector } from 'testcafe-react-selectors';

const TodoList         = ReactSelector('TodoApp TodoList');
const itemsCountStatus = ReactSelector('TodoApp div');
const itemsCount       = ReactSelector('TodoApp div span');
```

```js
const reactComponent      = ReactSelector('MyComponent');
const reactComponentState = await reactComponent.getReact();

// >> reactComponentState
//
// {
//     props:    <component_props>,
//     state:    <component_state>
// }
```

See the [repository documentation](https://github.com/DevExpress/testcafe-react-selectors/blob/master/README.md) for more information.

### Angular

Use the `AngularSelector` class to select DOM elements by the component name. Call it without parameters to get a root element. You can also search through the nested components or elements. In addition, you can obtain the component state.

```js
import { AngularSelector } from 'testcafe-angular-selectors';

const rootAngular       = AngularSelector();
const listComponent     = AngularSelector('list');
const listItemComponent = AngularSelector('list list-item');
```

```js
import { AngularSelector } from 'testcafe-angular-selectors';

const list        = AngularSelector('list');
const listAngular = await list.getAngular();

await t.expect(listAngular.testProp).eql(1);
```

To learn more, refer to the [plugin repository](https://github.com/DevExpress/testcafe-angular-selectors/blob/master/angular-selector.md).

### AngularJS

`AngularJSSelector` contains a set of static methods to search for an HTML element by the specified binding (`byModel`, `byBinding`, etc.).

```js
import { AngularJSSelector } from 'testcafe-angular-selectors';
import { Selector } from 'testcafe';

fixture `TestFixture`
    .page('http://todomvc.com/examples/angularjs/');

test('add new item', async t => {
    await t
        .typeText(AngularJSSelector.byModel('newTodo'), 'new item')
        .pressKey('enter')
        .expect(Selector('#todo-list').visible).ok();
});
```

Refer to the [plugin repository](https://github.com/DevExpress/testcafe-angular-selectors/blob/master/angularJS-selector.md) for more information.

### Vue

Vue selectors allow you to pick DOM elements by the component name. You can also search through the nested components or elements. In addition, you can obtain the component props, state and computed props.

```js
import VueSelector from 'testcafe-vue-selectors';

const rootVue   = VueSelector();
const todoInput = VueSelector('todo-input');
const todoItem  = VueSelector('todo-list todo-item');
```

```js
const vueComponent      = VueSelector('componentTag');
const vueComponentState = await vueComponent.getVue();

// >> vueComponentState
//
// {
//     props:    <component_props>,
//     state:    <component_state>,
//     computed: <component_computed>
// }
```

See the [repository documentation](https://github.com/DevExpress/testcafe-vue-selectors/blob/master/README.md) for more information.

### Aurelia

The Aurelia selectors plugin allows you to select page elements by JS expressions to which the element's attributes are bound.

```js
import AureliaSelector from 'testcafe-aurelia-selectors';

fixture `TestFixture`
    .page('http://todomvc.com/examples/aurelia/');

test('add new item', async t => {
    await t
        .typeText(AureliaSelector.byValueBind('newTodoTitle'), 'new item')
        .pressKey('enter')
        .expect(AureliaSelector.byShowBind('items.length').exists).ok();
});
```

See the [repository documentation](https://github.com/miherlosev/testcafe-aurelia-selectors/blob/master/README.md) for more information.

## Call Selectors from Node.js Callbacks

Selectors need access to the [test controller](../../reference/test-api/testcontroller/README.md) to be executed. When called right from the test function, they implicitly obtain the test controller.

However, if you need to call a selector from a Node.js callback that fires during the test run, you have to bind it to the test controller.

Use the [boundTestRun](../../reference/test-api/selector/with.md#optionsboundtestrun) option for this.

```js
import { http } from 'http';
import { Selector } from 'testcafe';

fixture `My fixture`
    .page `http://www.example.com/`;

const elementWithId = Selector(id => document.getElementById(id));

test('Title changed', async t => {
    const boundSelector = elementWithId.with({ boundTestRun: t });

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

    await t.expect(match).ok();
});
```

Use this approach for Node.js callbacks that fire during the test run. To ensure that the test function
does not finish before the callback is executed, suspend the test until the callback fires. For instance, you can introduce a Promise and wait until it completes synchronously, as shown in the example above.

## Limitations

* You cannot use generators or `async/await` syntax within selectors.

* Selectors cannot access variables defined in the outer scope in test code.
  However, you can use arguments to pass data inside the selectors, except for those that are self-invoked.
  They cannot take any parameters from the outside.

    Likewise, the return value is the only way to obtain data from selectors.

## Examples

### Access Page Element Properties

To work with page elements, use TestCafe selectors. Import the [Selector](../../reference/test-api/selector/constructor.md) function, call it and pass a CSS selector inside. This function creates a selector object [whose API](../../reference/test-api/domnodestate.md) exposes the most used members of HTML element API.

```js
import { Selector } from 'testcafe';

fixture `My fixture`
    .page `https://devexpress.github.io/testcafe/example/`;

test('My test', async t => {
    const element     = Selector('#developer-name');
    const clientWidth = await element.clientWidth;

    // do something with clientWidth
});
```

If you need to access element properties not included in the selector's API, use the [selector.addCustomDOMProperties](../../reference/test-api/selector/addcustomdomproperties.md) method to retrieve them from DOM.

```js
import { Selector } from 'testcafe';

fixture `My fixture`
    .page `https://example.com`;

test('Check Label HTML', async t => {
    const label = Selector('label').addCustomDOMProperties({
        innerHTML: el => el.innerHTML,
        tabIndex: el => el.tabIndex,
        lang: el => el.lang
    });

    await t
        .expect(label.innerHTML).contains('type="checkbox"')
        .expect(label.tabIndex).eql(2)
        .expect(label.lang).eql('en');
});
```

You can also use a [client function](obtain-client-side-info.md) to obtain a single element property from the client. In this case, you should pass the selector to client function's [dependencies](../../reference/test-api/clientfunction/constructor.md#optionsdependencies) option.

```js
import { Selector, ClientFunction } from 'testcafe';

fixture `My fixture`
    .page `https://devexpress.github.io/testcafe/example/`;

test('Check Label HTML', async t => {
    const label = Selector('label');

    const getLabelHtml = ClientFunction(() => label().innerHTML, { dependencies: { label } });

    await t
        .expect(getLabelHtml()).contains('type="checkbox"')
        .expect(getLabelHtml()).contains('name="remote"');
});
```

> Note that selector's property getters and client functions are asynchronous. If you need their resulting value in your code, use the `await` keyword.
>
> However, you can omit `await` when you pass a selector property or a client function value into an [assertion](assert.md). In this instance, TestCafe uses its [Smart Assertion Query Mechanism](assert.md#smart-assertion-query-mechanism) to wait until the value is available. This makes your tests more stable.

### Get a Page Element Using Custom Logic

Sometimes CSS selectors are not powerful enough to identify the required page element.
In this instance, you can introduce a function that picks the desired element.

```js
import { Selector } from 'testcafe';

fixture `My fixture`
    .page `https://devexpress.github.io/testcafe/example/`;

test('My test', async t => {
    const checkBoxesStartingWithR = Selector(() => {
        let labels = document.querySelectorAll('label');

        labels = Array.prototype.slice.call(labels);

        const targetLabels = labels.filter(label => label.textContent.match(/^R/));

        return targetLabels.map(label => label.children[0]);
    });

    await t.click(checkBoxesStartingWithR.nth(0));
});
```

### Access Child Nodes in the DOM Hierarchy

The [selector API](#member-tables) allows you to filter matching elements and search through adjacent elements in the DOM tree.

Selector API contains two types methods:

* methods that enumerate all node types
* methods that enumerate DOM elements only

<!-- markdownlint-disable MD033 -->
Methods                                                | Enumerated Nodes
------------------------------------------------------ | -------
[filter(function)](../../reference/test-api/selector/filter.md)<br/>[find](../../reference/test-api/selector/find.md)<br/>[parent](../../reference/test-api/selector/parent.md) | All nodes
[nth](../../reference/test-api/selector/nth.md)<br/>[withText](../../reference/test-api/selector/withtext.md)<br/>[withExactText](../../reference/test-api/selector/withexacttext.md)<br/>[withAttribute](../../reference/test-api/selector/withattribute.md)<br/>[filter(string)](../../reference/test-api/selector/filter.md)<br/>[filterVisible](../../reference/test-api/selector/filtervisible.md)<br/>[filterHidden](../../reference/test-api/selector/filterhidden.md)<br/>[child](../../reference/test-api/selector/child.md)<br/>[sibling](../../reference/test-api/selector/sibling.md)<br/>[nextSibling](../../reference/test-api/selector/nextsibling.md)<br/>[prevSibling](../../reference/test-api/selector/prevsibling.md) | Elements only
<!-- markdownlint-enable MD033 -->

The following example illustrates the difference between these methods and shows how to get a child text node for a given parent element.

Consider the following *example.html* page:

```js
<!DOCTYPE html>
<html>
    <body>
        This is my tested page. <!--This is the first child node of <body>-->
        <p>My first paragraph.</p>
        <p>My second paragraph.</p>
    </body>
</html>
```

Let's write a test that verifies text content of the body's first child node (*'This is my tested page'*).

To select this node, use the [find](../../reference/test-api/selector/find.md) method that enumerates all nodes. Compare it with the [child](../../reference/test-api/selector/child.md) method that skips the text node and returns the `<p>` element.

```js
import { Selector } from 'testcafe';

fixture `My Fixture`
    .page `example.html`;

const body              = Selector('body');
const firstChildElement = body.child(0);                 // <p>
const firstChildNode    = body.find((node, index) => {   // text node
    return index === 0;
});

test('My Test', async t => {
    await t
        .expect(firstChildElement.textContent).eql('My first paragraph.')
        .expect(firstChildNode.textContent).eql('\n        This is my tested page. ');
});
```

### Access Shadow DOM

CSS selectors passed to the [Selector](../../reference/test-api/selector/constructor.md) constructor cannot identify elements in the shadow DOM.

To select a shadow element, initialize a selector with client-side code and use the [shadowRoot](https://developer.mozilla.org/en-US/docs/Web/API/Element/shadowRoot) property to get and return the required element from shadow DOM.

The following example shows the `paragraph` selector that returns `<p>` from the shadow DOM.

```js
import { Selector } from 'testcafe';

fixture `My fixture`
    .page `https://chrisbateman.github.io/guide-to-web-components/demos/shadow-dom.htm`;

const demoPage = Selector('#demo1');

const paragraph = Selector(() => {
    return demoPageSelector().shadowRoot.querySelectorAll('p');
}, { dependencies: { demoPageSelector: demoPage } });

test('Get text within shadow root', async t => {
    await t.click(paragraph.nth(0));

    var text = await paragraph.nth(0).textContent;

    await t.expect(paragraph.nth(0).textContent).eql('These paragraphs are in a shadow root.');
});
```

The `paragraph` selector obtains [shadowRoot](https://developer.mozilla.org/en-US/docs/Web/API/Element/shadowRoot) from the `#demo1` element. The `demoPage` selector that identifies `#demo1` is passed as a [dependency](../../reference/test-api/selector/constructor.md#optionsdependencies).

### Check if an Element is Available

Generally speaking, introducing conditions in tests is not considered good practice because it indicates that your tests are non-deterministic.
The tested website should guarantee that the test writer knows the page state at any moment. If it is so, you need no conditions in test code.

However, in practice, things are usually a bit different. Many websites contain elements that may be invisible or non-existent at times.
In this instance, it may be a good idea to check the element availability before taking actions on it.

```js
import { Selector } from 'testcafe';

fixture `My fixture`
    .page `https://devexpress.github.io/testcafe/example/`;

test('My test', async t => {
    const element = Selector('#developer-name');

    if(await element.exists && await element.visible)
        await t.typeText(element, 'Peter Parker');

    // ...
});
```

### Enumerate Elements Identified by a Selector

Another common case is creating a selector that matches several elements to perform certain actions using all of them.

The following example clicks through a number of check boxes on the example page.

```js
import { Selector } from 'testcafe';

fixture `My fixture`
    .page `https://devexpress.github.io/testcafe/example/`;

test('My test', async t => {
    const checkboxes    = Selector('legend').withText('Which features are important to you:').parent(0).find('input');
    const checkboxCount = await checkboxes.count;

    for(let i = 0; i < checkboxCount; i++)
        await t.click(checkboxes.nth(i));
});
```

### Select Elements With Dynamic IDs

TestCafe selectors should use element identifiers that persist between test runs. However, many JavaScript frameworks generate dynamic IDs for page elements. To identify elements whose `id` attribute changes, use selectors based on the element's class, content, tag name, or position:

* [withText](../../reference/test-api/selector/withtext.md),
* [withExactText](../../reference/test-api/selector/withexacttext.md),
* [withAttribute](../../reference/test-api/selector/withattribute.md),
* [parent](../../reference/test-api/selector/parent.md),
* [child](../../reference/test-api/selector/child.md),
* [sibling](../../reference/test-api/selector/sibling.md),
* [nextSibling](../../reference/test-api/selector/nextsibling.md),
* [prevSibling](../../reference/test-api/selector/prevsibling.md).

**Example**

```html
<html>
    <body>
        <div id="j9dk399sd304" class="container">
            <div id="dsf054k45o3e">Item 1</div>
            <div id="lk94km904wfv">Item 2</div>
        </div>
    </body>
</html>
```

```js
import { Selector } from 'testcafe';

fixture `My fixture`
    .page `http://localhost/`;

test('My test', async t => {
    const container = Selector('div').withAttribute('class', 'container');
    const item1     = Selector('div').withText('Item 1');
    const item2     = container.child(1);
});
```

If the element's ID is partially dynamic, you can use the following selectors to match the ID's static part:

* [withAttribute(RegExp)](../../reference/test-api/selector/withattribute.md)
* [[attribute~=value]](https://www.w3schools.com/cssref/sel_attribute_value_contains.asp),
* [[attribute|=value]](https://www.w3schools.com/cssref/sel_attribute_value_lang.asp),
* [[attribute^=value]](https://www.w3schools.com/cssref/sel_attr_begin.asp),
* [[attribute$=value]](https://www.w3schools.com/cssref/sel_attr_end.asp),
* [[attribute*=value]](https://www.w3schools.com/cssref/sel_attr_contain.asp).

**Example**

```html
<html>
    <body>
        <div id="9fgk309d3-wrapper-9f">
            <div id="g99dsf99sdfg-container">
                <div id="item-df9f9sfd9fd9">Item</div>
            </div>
        </div>
    </body>
</html>
```

```js
import { Selector } from 'testcafe';

fixture `My fixture`
    .page `http://localhost/`;

test('My test', async t => {
    const wrapper   = Selector('div').withAttribute('id', /\w+-wrapper-\w+/);
    const container = Selector('[id$="container"]');
    const item      = Selector('[id|="item"]');
});
```

### Have a different use case?

If none of the examples fit your requirements and you encounter difficulties, let us know on StackOverflow.
We review and answer questions with the [TestCafe](https://stackoverflow.com/questions/tagged/testcafe) tag.
