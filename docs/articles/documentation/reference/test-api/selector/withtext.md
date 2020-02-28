---
layout: docs
title: Selector.withText Method
permalink: /documentation/reference/test-api/selector/withtext.html
---
# Selector.withText Method

Finds an element whose content includes the specified text.

## Syntax

### withText(text)

```text
Selector().withText(text) → Selector
```

Selects elements that *contain* the specified text.

Argument | Type   | Description
-------- | ------ | --------------
`text`  | String | The element's text content. The `text` argument is case-sensitive.

To filter elements by *strict match*, use the [withExactText](withexacttext.md) method.

### withText(re)

```text
Selector().withText(re) → Selector
```

Selects elements whose text content matches the specified regular expression.

Argument | Type   | Description
-------- | ------ | --------------
`re`  | RegExp | A regular expression that should match the element's text.

## Examples

```js
// Selects label elements that contain 'foo'.
// Matches 'foo', 'foobar'. Does not match 'bar', 'Foo'.
Selector('label').withText('foo');

// Selects div elements whose text matches
// the /a[b-e]/ regular expression.
// Matches 'ab', 'ac'. Does not match 'bb', 'aa'.
Selector('div').withText(/a[b-e]/);
```

## Notes

`withText` selects the element that contains the specified text and its ancestors.

Consider the following markup.

```html
<div class="container">
    <div class="child">foo</div>
</div>
```

A selector that targets `div` elements with the text `foo` matches both elements (the parent followed by the child).

```js
// This selector matches the parent div (.container)
// and then the child div (.child)
Selector('div').withText('foo');
```
