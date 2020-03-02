---
layout: docs
title: Selector.with Method
permalink: /documentation/reference/test-api/selector/with.html
---
# Selector.with Method

Overwrites the selector [options](#options).

Use `with` to derive selectors with different settings from the same base selector.

```text
selector.with( options ) → Selector
```

`with` returns a new selector with a different set of [options](#options) that includes options from the original selector and new `options` that overwrite them.

The sample below shows how to overwrite the selector options so that it waits for the selected element to become visible.

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

{% include selectors/selector-options.md %}