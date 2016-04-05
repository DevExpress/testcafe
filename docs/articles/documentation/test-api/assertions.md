---
layout: docs
title: Assertions
permalink: /documentation/test-api/assertions.html
---
# Assertions

To check that the state of the tested webpage matches the one you expect, use *assertions*.

We ship no assertion library with TestCafe. You can choose whatever 3rd-party library you like.

In this documentation, we use [Chai assertions, BDD-style](http://chaijs.com/api/bdd/) for demonstration.

> In order to make an assertion, you need to know the recent state of the webpage and its elements.
> This means that you need to access the webpage on the client side. To learn how to do this,
> see [Selecting Page Elements](selecting-page-elements/index.md).

The following sample fixture demonstrates how to use assertions.

```js
import { expect } from 'chai';

fixture `My fixture`
    .page('http://example.com');

test('Test 1', async t => {
    await t.click('#myelem');

    const myElement = await t.select(() => document.getElementById('myelem'));

    expect(myElement.visible).to.be.true;
});

test('Test 2', async t => {
    await t
        .typeText('#input', 'Hello world!')
        .click('#apply');

    const header = await t.select(() => document.getElementById('header'));

    expect(header.textContent).to.equal('Hello world!');
});
```