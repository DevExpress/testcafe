---
layout: docs
title: Selector.nth Method
permalink: /documentation/reference/test-api/selector/nth.html
---
# Selector.nth Method

Selects an element with the specified index in the matched set.

```text
Selector().nth(index) → Selector
```

Argument | Type   | Description
-------- | ------ | --------------
`index`  | Number | The zero-based index. If `index` is negative, the index is counted from the end of the matched set.

## Examples

```js
// Selects the third ul element.
Selector('ul').nth(2);

// Selects the last div element.
Selector('div').nth(-1);
```