---
layout: docs
title: Assertions
permalink: /documentation/test-api/assertions.html
checked: true
---
# Assertions

To check if the state of the tested webpage matches the one you expect to see, use *assertions*.

You can use assertions from Node's built-in [assert](https://nodejs.org/api/assert.html) module or choose whatever 3rd-party library you like.

Examples in this documentation use [BDD-style Chai assertions](http://chaijs.com/api/bdd/) for demonstration purposes.

> In order to make an assertion, you need to know the recent state of the webpage and its elements.
> This means that you need to access the webpage on the client side. To learn how to do this,
> see [Selecting Page Elements](selecting-page-elements/index.md).

The following sample fixture demonstrates how to use assertions.

```js
import { Selector } from 'testcafe';

fixture `My fixture`
    .page `http://example.com`;

test('Test 1', async t => {
    await t
        .click('#myelem')
        .expect(Selector('#myelem').visible).ok();
});

test('Test 2', async t => {
    await t
        .typeText('#input', 'Hello world!')
        .click('#apply')
        .expect(Selector('#header').textContent).eql('Hello world!');
});
```
