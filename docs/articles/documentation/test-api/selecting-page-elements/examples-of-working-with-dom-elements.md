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
* [Check if an Element is Available](#check-if-an-element-is-available)
* [Enumerate Elements Identified by a Selector](#enumerate-elements-identified-by-a-selector)

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

> Note that all property getters are asynchronous, so add the `await` keyword.

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

    const getLabelHtml = ClientFunction(() => label.innerHTML, { dependencies: { label } });

    await t
        .expect(getLabelHtml()).contains('type="checkbox"')
        .expect(getLabelHtml()).contains('name="remote"');
});
```

Note that the `await` keyword can be omitted when specifying a selector property in an [assertion](../assertions/README.md). This activates the [Smart Assertion Query Mechanism](../assertions/README.md#smart-assertion-query-mechanism).

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

The selector API includes methods that allow you to [search for elements in the DOM tree](selectors/functional-style-selectors.md#search-for-elements-in-the-dom-hierarchy). For instance, you can use the [child](selectors/functional-style-selectors.md#child), [parent](selectors/functional-style-selectors.md#parent), and [sibling](selectors/functional-style-selectors.md#sibling) methods to traverse up, down or aside through the hierarchy.

However, these methods have a limitation. They iterate DOM elements only and ignore other node types. To get a child text node for a selector, use a function as shown in this example.

Consider the following *example.html* page:

```js
<!DOCTYPE html>
<html>
    <body id="testedpage">
        This is my tested page. <!--This is the first child node of <body>-->
        <p>My first paragraph.</p>
        <p>My second paragraph.</p>
    </body>
</html>
```

Assume you need to verify text content of the first node in the `<body>` (*'This is my tested page'*).

First, create a selector that identifies the `testedpage` element. Then pass this selector as a [dependency](selectors/selector-options.md#optionsdependencies) to another selector that returns the [childNodes](https://developer.mozilla.org/en-US/docs/Web/API/Node/childNodes) collection.

```js
import { Selector } from 'testcafe';
import { ClientFunction } from 'testcafe';

fixture `My Fixture`
    .page `example.html`;

    const testedPage = Selector('#testedpage');

    const childNodes = Selector(() => {
        return getPage().childNodes;
    },{ dependencies: { getPage: testedPage } });


test('My Test', async t => {
    await t.expect(childNodes.nth(0).textContent).contains('This is my tested page.');
});
```

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

## More Examples

If you encounter a difficult situation while working with DOM elements,
let us know by posting on StackOverflow. We review and answer questions
with the [TestCafe](https://stackoverflow.com/questions/tagged/testcafe) tag.
If you are not alone we will add an example to this topic.