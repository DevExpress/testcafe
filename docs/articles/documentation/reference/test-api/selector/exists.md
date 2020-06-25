---
layout: docs
title: Selector.exists Property
permalink: /documentation/reference/test-api/selector/exists.html
---
# Selector.exists Property

Determines if at least one matching element exists.

```text
Selector().exists → Promise<Boolean>
```

Selector can return a single matching DOM element on the page, multiple elements, or nothing. Use the `exists` property to check whether matching elements exist.

```js
import { Selector } from 'testcafe';

fixture `Example page`
    .page `http://devexpress.github.io/testcafe/example/`;

test('My test', async t => {
    const submitButtonExists = Selector('#submit-button').exists;

    await t.expect(submitButtonExists).ok();
});
```

To determine the number of matching elements, use the [count](count.md) property.