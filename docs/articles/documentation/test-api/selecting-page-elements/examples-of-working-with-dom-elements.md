---
layout: docs
title: Examples of Working with DOM Elements
permalink: /documentation/test-api/selecting-page-elements/examples-of-working-with-dom-elements.html
---
# Examples of Working with DOM Elements

This document shows how to work with DOM elements in frequent real-world situations.

* [Access Page Element Properties](#access-page-element-properties)
* [Get a Page Element Using Custom Logic](#get-a-page-element-using-custom-logic)
* [Access Child Nodes in the DOM Hierarchy](#access-child-nodes-in-the-dom-hierarchy)
* [Access Shadow DOM](#access-shadow-dom)
* [Check if an Element is Available](#check-if-an-element-is-available)
* [Enumerate Elements Identified by a Selector](#enumerate-elements-identified-by-a-selector)
* [Select Elements With Dynamic IDs](#select-elements-with-dynamic-ids)

## Access Page Element Properties

To work with page elements, use TestCafe [selectors](selectors/README.md). Import the `Selector` function, call it and pass a CSS selector inside. This function creates a selector object [whose API](dom-node-state.md) exposes the most used members of HTML element API.

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

If you need to access element properties not included in the selector's API, use the [selector.addCustomDOMProperties](selectors/extending-selectors.md) method to retrieve them from DOM.

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

You can also use a [client function](../obtaining-data-from-the-client/README.md) to obtain a single element property from the client. In this case, you should pass the selector to client function's [dependencies](../obtaining-data-from-the-client/README.md#optionsdependencies) option.

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
> However, you can omit `await` when you pass a selector property or a client function value into an [assertion](../assertions/README.md). In this instance, TestCafe uses its [Smart Assertion Query Mechanism](../assertions/README.md#smart-assertion-query-mechanism) to wait until the value is available. This makes your tests more stable.

## Get a Page Element Using Custom Logic

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

## Access Child Nodes in the DOM Hierarchy

The [selector API](selectors/functional-style-selectors.md) allows you to filter matching elements and search through adjacent elements in the DOM tree.

Selector API contains two types methods:

* methods that enumerate all node types
* methods that enumerate DOM elements only

<!-- markdownlint-disable MD033 -->
Methods                                                | Enumerated Nodes
------------------------------------------------------ | -------
[filter(function)](selectors/functional-style-selectors.md#filter)<br/>[find](selectors/functional-style-selectors.md#find)<br/>[parent](selectors/functional-style-selectors.md#parent) | All nodes
[nth](selectors/functional-style-selectors.md#nth)<br/>[withText](selectors/functional-style-selectors.md#withtext)<br/>[withExactText](selectors/functional-style-selectors.md#withexacttext)<br/>[withAttribute](selectors/functional-style-selectors.md#withattribute)<br/>[filter(string)](selectors/functional-style-selectors.md#filter)<br/>[filterVisible](selectors/functional-style-selectors.md#filtervisible)<br/>[filterHidden](selectors/functional-style-selectors.md#filterhidden)<br/>[child](selectors/functional-style-selectors.md#child)<br/>[sibling](selectors/functional-style-selectors.md#sibling)<br/>[nextSibling](selectors/functional-style-selectors.md#nextsibling)<br/>[prevSibling](selectors/functional-style-selectors.md#prevsibling) | Elements only
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

To select this node, use the [find](selectors/functional-style-selectors.md#find) method that enumerates all nodes. Compare it with the [child](selectors/functional-style-selectors.md#child) method that skips the text node and returns the `<p>` element.

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

## Access Shadow DOM

CSS selectors passed to the [Selector](selectors/creating-selectors.md) constructor cannot identify elements in the shadow DOM.

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

The `paragraph` selector obtains [shadowRoot](https://developer.mozilla.org/en-US/docs/Web/API/Element/shadowRoot) from the `#demo1` element. The `demoPage` selector that identifies `#demo1` is passed as a [dependency](selectors/selector-options.md#optionsdependencies).

## Check if an Element is Available

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

## Enumerate Elements Identified by a Selector

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

## Select Elements With Dynamic IDs

TestCafe selectors should use element identifiers that persist between test runs. However, many JavaScript frameworks generate dynamic IDs for page elements. To identify elements whose `id` attribute changes, use selectors based on the element's class, content, tag name, or position:

* [withText](selectors/functional-style-selectors.md#withtext),
* [withExactText](selectors/functional-style-selectors.md#withexacttext),
* [withAttribute](selectors/functional-style-selectors.md#withattribute),
* [parent](selectors/functional-style-selectors.md#parent),
* [child](selectors/functional-style-selectors.md#child),
* [sibling](selectors/functional-style-selectors.md#sibling),
* [nextSibling](selectors/functional-style-selectors.md#nextsibling),
* [prevSibling](selectors/functional-style-selectors.md#prevsibling).

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

* [withAttribute(RegExp)](selectors/functional-style-selectors.md#withattribute)
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

## Have a different use case?

If none of the examples fit your requirements and you encounter difficulties, let us know on StackOverflow.
We review and answer questions with the [TestCafe](https://stackoverflow.com/questions/tagged/testcafe) tag.
