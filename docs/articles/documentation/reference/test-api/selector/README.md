---
layout: docs
title: Selector Object
permalink: /documentation/reference/test-api/selector/
---
# Selector Object

A [selector](../../../guides/basic-guides/select-page-elements.md) that identifies page elements to perform an [action](../../../guides/basic-guides/interact-with-the-page.md) with them (click, drag, etc.) or check their state in an [assertion](../../../guides/basic-guides/assert.md).

Use the [Selector](constructor.md) constructor to create a selector.

```js
import { Selector } from 'testcafe';

const article = Selector('#article-content');
```

The following methods filter elements from the selector:

Method                                                              | Description
------------------------------------------------------------------- | -------------
[nth](nth.md)                     | Finds an element by its index.
[withText](withtext.md)           | Finds an element whose content includes the specified text.
[withExactText](withexacttext.md) | Finds an element with the specified text.
[withAttribute](withattribute.md) | Finds an element with the specified attribute or attribute value.
[filterVisible](filtervisible.md) | Selects visible elements.
[filterHidden](filterhidden.md)   | Selects hidden elements.
[filter](filter.md)               | Finds elements that match the specified CSS selector or predicate.

Methods that search for DOM elements relative to the selected element:

Method                                                              | Description
------------------------------------------------------------------- | -------------
[find](find.md)                   | Finds a descendant node that matches the specified CSS selector or predicate.
[parent](parent.md)               | Selects parent elements.
[child](child.md)                 | Selects child elements.
[sibling](sibling.md)             | Selects sibling elements.
[nextSibling](nextsibling.md)     | Selects succeeding sibling elements.
[prevSibling](prevsibling.md)     | Selects preceding sibling elements.

For more information, see [Select Page Elements](../../../guides/basic-guides/select-page-elements.md).
