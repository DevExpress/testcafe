---
layout: docs
redirect_to: https://testcafe.io/documentation/402666/reference/test-api/selector
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

{% include selectors/selector-members.md%}

For more information, see [Select Page Elements](../../../guides/basic-guides/select-page-elements.md).
