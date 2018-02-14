---
layout: docs
title: Examples of Working with DOM Elements
permalink: /documentation/test-api/selecting-page-elements/examples-of-working-with-dom-elements.html
---
# Examples of Working with DOM Elements

This document shows how to work with DOM elements in frequent real-world situations.

* [Accessing Page Element Properties](#accessing-page-element-properties)
* [Getting a Page Element Using Custom Logic](#getting-a-page-element-using-custom-logic)
* [Checking if an Element is Available](#checking-if-an-element-is-available)
* [Enumerating Elements Identified by a Selector](#enumerating-elements-identified-by-a-selector)

## Accessing Page Element Properties

To work with page elements, use TestCafe [selectors](selectors/README.md).
Import the `Selector` function and call it passing a CSS selector inside.
This function creates a selector object whose [API](dom-node-state.md) exposes the most used members of HTML element API.

Note that all property getters are asynchronous, so add the `await` keyword.

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

If you need to access an element property not included in the selector's API, request it explicitly by using the [addCustomDOMProperties](selectors/extending-selectors.md) method.

```js
import { Selector } from 'testcafe';

fixture `My fixture`
    .page `https://devexpress.github.io/testcafe/example/`;

test('Check Label HTML', async t => {
    const label = Selector('label').addCustomDOMProperties({
        innerHTML: el => el.innerHTML
    });

    await t
        .expect(label.innerHTML).contains('type="checkbox"')
        .expect(label.innerHTML).contains('name="remote"');
});
```

Note that the `await` keyword can be omitted when specifying a selector property in an [assertion](../assertions/README.md). This activates the [Smart Assertion Query Mechanism](../assertions/README.md#smart-assertion-query-mechanism).

## Getting a Page Element Using Custom Logic

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

## Checking if an Element is Available

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

## Enumerating Elements Identified by a Selector

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
let us know by posting on [our forum](https://testcafe-discuss.devexpress.com/)
and if you are not alone we will add an example to this topic.