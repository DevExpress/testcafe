---
layout: docs
title: Testing &lt;select&gt; Elements
permalink: /documentation/recipes/testing-select-elements.html
---
# Testing \<select\> Elements

This recipe shows how to test `<select>` elements and pick options from the drop-down list.

Assume the following `<select>` element.

```html
<select id="city">
    <option>New York</option>
    <option>London</option>
    <option>Paris</option>
</select>
```

This is a simple drop-down list that contains three values for `New York`, `London` and `Paris`.

In this recipe, you will learn how to create a test that selects a value from this list
and checks that the `<select>` element contains the right city.

Here is the full test code and further we will reproduce it step by step.

```js
import { Selector } from 'testcafe';

fixture `Test select element`
    .page `http://localhost:8080`;

const citySelect = Selector('#city');
const cityOption = citySelect.find('option');

test(`Select an option from the drop-down menu`, async t => {
    await t
        .click(citySelect)
        .click(cityOption.withText('London'))
        .expect(citySelect.value).eql('London');
});
```

Begin with an empty test.

```js
import { Selector } from 'testcafe';

fixture `Test select element`
    .page `http://localhost:8080`;

test(`Select an option from the drop-down menu`, async t => {
    // Here you will put test code.
});
```

First, you need a [selector](../test-api/selecting-page-elements/selectors/README.md) that picks the `<select>` element.

```js
const citySelect = Selector('#city');
```

Use this selector to click the element and invoke the drop-down menu.

```js
await t.click(citySelect);
```

Next, write code that selects `London` from the drop-down list. To this end, introduce a selector that identifies options.
This selector uses the [find](../test-api/selecting-page-elements/selectors/functional-style-selectors.md#find) function to locate `<option>` elements inside `<select>`.

```js
const cityOption = citySelect.find('option');
```

To find the `London` value, use the selector's filter methods that include [withText](../test-api/selecting-page-elements/selectors/functional-style-selectors.md#withtext), [nth](../test-api/selecting-page-elements/selectors/functional-style-selectors.md#nth) and
[withAttribute](../test-api/selecting-page-elements/selectors/functional-style-selectors.md#withattribute).
Then pass this selector to the `click` method.

```js
await t
    .click(citySelect)
    .click(cityOption.withText('London'));
```

Finally, add an assertion that checks that the `<select>` element has the `London` value selected.

```js
await t
    .click(citySelect)
    .click(cityOption.withText('London'))
    .expect(citySelect.value).eql('London');
```