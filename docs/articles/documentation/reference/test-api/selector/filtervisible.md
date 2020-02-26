---
layout: docs
title: Selector.filterVisible Method
permalink: /documentation/reference/test-api/selector/filtervisible.html
---
# Selector.filterVisible Method

Selects visible elements only.

```text
Selector().filterVisible() → Selector
```

The elements that *do not* have `display: none` or `visibility: hidden` CSS properties and have non-zero width and height are considered visible.

## Example

```js
// Selects all visible div elements.
Selector('div').filterVisible();
```