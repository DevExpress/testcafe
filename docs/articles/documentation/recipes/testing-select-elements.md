---
layout: docs
title: Testing %lt;select&gt; Elements
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

This is a simple drop-down list that contains three cities.

Begin with an empty test.

```js
import { Selector } from 'testcafe';

fixture `Test select element`
    .page `http://localhost:8080`;

test(`Select an option from the drop-down menu`, async t => {
    // Here you will put test code.
});
```

First, you need a [selector](../test-api/selecting-page-elements/selectors.md) that picks the `<select>` element.
Use this selector to click the element and invoke the drop-down menu.

```js
import { Selector } from 'testcafe';

fixture `Test select element`
    .page `http://localhost:8080`;

const citySelect = Selector('#city');

test(`Select an option from the drop-down menu`, async t => {
    await t
        .click(citySelect);
});
```

Next, write code that selects `London` from the drop-down list. To this end, introduce a selector that identifies options.
This selector uses the [find](../test-api/selecting-page-elements/selectors.md#find) function to locate `<option>` elements inside `<select>`.

To find the London value, call the [withText](../test-api/selecting-page-elements/selectors.md#withtext) method with the `'London'` parameter.
Then pass this selector to the `click` method.

```js
import { Selector } from 'testcafe';

fixture `Test select element`
    .page `http://localhost:8080`;

const citySelect = Selector('#city');
const cityOption = citySelect.find('option');

test(`Select an option from the drop-down menu`, async t => {
    await t
        .click(citySelect)
        .click(city.withText('London'));
});
```

Finally, add an assertion that checks that the `<select>` element has the `'London'` value selected.

```js
import { Selector } from 'testcafe';

fixture `Test select element`
    .page `http://localhost:8080`;

const citySelect = Selector('#city');
const cityOption = citySelect.find('option');

test(`Select an option from the drop-down menu`, async t => {
    await t
        .click(citySelect)
        .click(city.withText('London'))
        .expect(citySelect.value).eql('London');
});
```

In this simple recipe, we have demonstrated how you can handle the `<select>` element in your tests.