---
layout: docs
title: Selector.count Property
permalink: /documentation/reference/test-api/selector/count.html
---
# Selector.count Property

Returns the number of elements that match the selector.

```text
Selector().count → Promise<Number>
```

Selectors can return a single matching DOM element on the page, multiple elements or nothing. Use the `count` property to determine the number of matching elements.

```js
import { Selector } from 'testcafe';

fixture `Example page`
    .page `http://devexpress.github.io/testcafe/example/`;

test('My test', async t => {
    const osCount = Selector('.column.col-2 label').count;

    await t.expect(osCount).eql(3);
});
```

To check whether matching elements exist, use the [exists](exists.md) property.