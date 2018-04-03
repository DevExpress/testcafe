---
layout: docs
title: Selectors
permalink: /documentation/test-api/selecting-page-elements/selectors/
checked: false
---
# Selectors

A selector is a function that identifies a webpage element in the test.
The selector API provides methods and properties to select elements on the page and get their state.
You can use selectors to [inspect elements state on the page](using-selectors.md#obtain-element-state), define [action targets](using-selectors.md#define-action-targets) and
[assertion actual values](using-selectors.md#define-assertion-actual-value).

> Important! Do not modify the tested webpage within selectors.
> To interact with the page, use [test actions](../../actions/README.md).

## Quick Start

Import the [Selector](creating-selectors.md) constructor from the `testcafe` module. Call this constructor and pass a CSS selector string as an argument.

```js
import { Selector } from 'testcafe';

const article = Selector('.article-content');
```

The `article` constant now stores a selector that identifies an element with the `article-content` class.

You can use this selector to take [actions](../../actions/README.md) on this element.

```js
await t.click(article);
```

Or use it in [assertions](../../assertions/README.md).

```js
await t.expect(article.scrollHeight).eql(1800);
```

You can write a selector that matches several page elements and then [filter them](functional-style-selectors.md#filter-dom-nodes) by text, attribute, etc.

```js
const windowsRadioButton  = Selector('.radio-button').withText('Windows');
const selectedRadioButton = Selector('.radio-button').withAttribute('selected');
```

If you need to find a specific element in the DOM tree, you can
[search for it](functional-style-selectors.md#search-for-elements-in-the-dom-hierarchy) using the selector API.

```js
const buttonWrapper = Selector('.article-content').find('#share-button').parent();
```

For more information about selectors, see the detailed topics in this section.

* [Creating Selectors](creating-selectors.md)
* [Using Selectors](using-selectors.md)
* [Functional-Style Selectors](functional-style-selectors.md)
* [Selector Options](selector-options.md)
* [Extending Selectors](extending-selectors.md)
* [Edge Cases and Limitations](edge-cases-and-limitations.md)

Note that you can use [client functions](../../obtaining-data-from-the-client/README.md) to obtain page information that does not relate to elements' state.