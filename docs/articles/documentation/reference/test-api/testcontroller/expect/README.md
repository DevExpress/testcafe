---
layout: docs
title: t.expect Method
permalink: /documentation/reference/test-api/testcontroller/expect/
---
# t.expect Method

This method accepts the actual value.

You can pass a value, a [Selector's DOM node state property](../../../../guides/basic-guides/select-page-elements.md#define-assertion-actual-value)
or a [client function](../../../../guides/basic-guides/obtain-client-side-info.md) promise.
TestCafe automatically waits for node state properties to obtain a value and for client functions to execute. See [Smart Assertion Query Mechanism](../../../../guides/basic-guides/assert.md#smart-assertion-query-mechanism) for details.

The value passed as the `actual` parameter should be a data type the assertion method accepts.

> You cannot pass a regular promise to the `expect` method unless the options.allowUnawaitedPromise option is enabled.
>
> {% include assertions/allowunawaitedpromise.md %}

The `expect` method is followed by an assertion method that accepts an expected value
and optional arguments.
The following assertion methods are available:

* [Deep Equal](eql.md)
* [Not Deep Equal](noteql.md)
* [Ok](ok.md)
* [Not Ok](notok.md)
* [Contains](contains.md)
* [Not Contains](notcontains.md)
* [Type of](typeof.md)
* [Not Type of](nottypeof.md)
* [Greater than](gt.md)
* [Greater than or Equal to](gte.md)
* [Less than](lt.md)
* [Less than or Equal to](lte.md)
* [Within](within.md)
* [Not Within](notwithin.md)
* [Match](match.md)
* [Not Match](notmatch.md)

The code snippet below demonstrates how to use `expect` method in a test:

```js
import { Selector } from 'testcafe';


fixture `Example page`
   .page `http://devexpress.github.io/testcafe/example/`;


test('Check property of element', async t => {
   const developerNameInput = Selector('#developer-name');

   await t
       .expect(developerNameInput.value).eql('', 'input is empty')
       .typeText(developerNameInput, 'Peter Parker')
       .expect(developerNameInput.value).contains('Peter', 'input contains text "Peter"');
});
```
