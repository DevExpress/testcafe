---
layout: docs
title: Selector.filterHidden Method
permalink: /documentation/reference/test-api/selector/filterhidden.html
---
# Selector.filterHidden Method

Selects hidden elements only.

```text
Selector().filterHidden() → Selector
```

The elements that have a `display: none` or `visibility: hidden` CSS property or zero width or height are considered hidden.

## Example

```js
// Selects all hidden label elements.
Selector('label').filterHidden();
```