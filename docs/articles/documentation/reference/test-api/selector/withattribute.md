---
layout: docs
title: Selector.withAttribute Method
permalink: /documentation/reference/test-api/selector/withattribute.html
---
# Selector.withAttribute Method

Finds elements that contain the specified attribute and, optionally, attribute value.

```text
Selector().withAttribute(attrName [, attrValue]) → Selector
```

Argument                     | Type                 | Description
----------------------------- | -------------------- | -------
`attrName`                    | String &#124; RegExp | The attribute name. This parameter is case-sensitive.
`attrValue`&#160;*(optional)* | String &#124; RegExp | The attribute value. This parameter is case-sensitive. You can omit it to select elements that have the `attrName` attribute regardless of the value.

If `attrName` or `attrValue` is a string, `withAttribute` uses **strict match** to select an element.

## Examples

```js
// Selects div elements that have the 'myAttr' attribute.
// This attribute can have any value.
Selector('div').withAttribute('myAttr');

// Selects div elements whose 'attrName' attribute
// is set to 'foo'. Does not match
// the 'otherAttr' attribute, or the 'attrName' attribute
// with the 'foobar' value.
Selector('div').withAttribute('attrName', 'foo');

// Selects ul elements that have an attribute whose
// name matches the /[123]z/ regular expression.
// This attribute must have a value that matches
// the /a[0-9]/ regular expression.
// Matches the '1z' and '3z' attributes with the
// 'a0' and 'a7' values.
// Does not match the '4z' or '1b' attribute,
// as well as any attribute with the 'b0' or 'ab' value.
Selector('ul').withAttribute(/[123]z/, /a[0-9]/);
```
