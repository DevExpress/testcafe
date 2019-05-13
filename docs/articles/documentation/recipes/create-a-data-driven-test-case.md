---
layout: docs
title: Create Data-Driven Tests
permalink: /documentation/recipes/create-data-driven-tests.html
---
# Create Data-Driven Tests

[Data-driven testing](https://en.wikipedia.org/wiki/Data-driven_testing) is a procedure when you repeat the same test scenario with different input parameters and then verify the result with the given output values.

Assume you have a `data.json` file with data objects (*test cases*) that consist of two input values (`name` and `comment`) and a value that specifies the expected result (`resultText`).

```json
[
    {
        "name": "John Heart",
        "comment": "I love TestCafe!",
        "resultText": "Thank you, John Heart!"
    },
    {
        "name": "Olivia Peyton",
        "comment": "TestCafe is awesome!",
        "resultText": "Thank you, Olivia Peyton!"
    }
]
```

To create data-driven tests, iterate through the test cases, call the [test](../test-api/test-code-structure.md#tests) method at each iteration and write [test actions](../test-api/actions/README.md) and [assertions](../test-api/assertions/README.md) that use test case parameters.

```js
import { Selector } from 'testcafe';

const dataSet = require('./data.json');

fixture `Data-Driven Tests`
    .page `https://devexpress.github.io/testcafe/example/`;

dataSet.forEach(data => {
    test(`Enter '${data.name}'`, async t => {
        await t
            .typeText('#developer-name', data.name)
            .click('#tried-test-cafe')
            .typeText('#comments', data.comment)
            .click('#submit-button')
            .expect(Selector('#article-header').textContent).eql(data.resultText);
    });
});
```

> **Tip:** you can store test cases in objects, arrays, [Maps](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map), [Sets](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set), etc., and iterate through them as you need. You can place them in a test file or import from `.json`, `.js`, `.ts`, etc.

A test case can include multiple tests:

```js
dataSet.forEach(data => {
    test(`Check one thing`, async t => {
        // ...
    });

    test(`Check something else`, async t => {
        // ...
    });
});
```

You can also introduce conditional actions that depend on test case parameters:

```js
if(data.shouldClick)
    await t.click(page.button);
```
