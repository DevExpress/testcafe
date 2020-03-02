---
layout: docs
title: Selector.withExactText Method
permalink: /documentation/reference/test-api/selector/withexacttext.html
---
# Selector.withExactText Method

Selects elements whose text content *strictly matches* the specified text.

```text
Selector().withExactText(text) → Selector
```

Argument | Type   | Description
-------- | ------ | --------------
`text`  | String | The element's text content. The `text` argument is case-sensitive.

To search for elements that *contain* a specific text, use the [withText](withtext.md) method.

## Example

```js
// Selects elements of the 'container' class
// whose text exactly matches 'foo'.
// Does not match 'bar', 'foobar', 'Foo'.
Selector('.container').withExactText('foo');
```

## Notes

`withExactText` selects the element that contains the specified text and its ancestors (if they do not contain any other text). See an example for [withText](withtext.md#notes).