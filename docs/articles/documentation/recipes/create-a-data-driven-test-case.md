---
layout: docs
title: Create Data-Driven Tests
permalink: /documentation/recipes/create-data-driven-tests.html
---
# Create Data-Driven Tests

You do [data-driven testing](https://en.wikipedia.org/wiki/Data-driven_testing) when you repeat the same test scenario with different input parameters and then verify the result with the given output values.

## Data-Driven Test Cases

Assume you have a `data.json` file with data objects (*test cases*) that consist of two input values (`id` and `quantity`) and a value that describes the expected result.

```json
[
    {
        "id": "ID-1234",
        "quantity": 100,
        "result": true
    },
    {
        "id": "ID-5678",
        "quantity": 500,
        "result": false
    }
]
```

To create data-driven tests, iterate through the test cases, call the [test](../test-api/test-code-structure.md#tests) method at each iteration and write [test actions](../test-api/actions/README.md) and [assertions](../test-api/assertions/README.md) that use the object's values.

```js
const dataSet   = require('./data.json');
const PageModel = require('./page-model.js');
const page      = new PageModel();

fixture `Data-Driven Fixture`
    .page `https://mycorp.com`;

dataSet.forEach(data => {
    test(`Check ID ${data.id}`, async t => {
        await t
            .typeText(page.idField, data.id)
            .typeText(page.quantityField, data.quantity)
            .click(page.submitButton)
            .expect(page.someElement.visible).eql(data.result);
    });
});
```

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

You can also introduce conditional test actions when required:

```js
if(data.shouldClick)
    await t.click(page.button);
```

## Data-Driven Fixtures

Assume a more advanced scenario in which you have a set of higher level input parameters, and you need to run different test cases for each of their values.

For instance, the following JSON shows test data with two such parameters: `urlPath` and `initValue`. Each combination of these parameters has its own `testCases`.

```json
[
    {
        "urlPath": "some/path/",
        "initValue": "ABC",
        "testCases": [{
            "id": "ID-1234",
            "quantity": 100,
            "result": true
        }, {
            "id": "ID-2345",
            "quantity": 200,
            "result": true
        }]
    },
    {
        "urlPath": "different/path/",
        "initValue": "XYZ",
        "testCases": [{
            "id": "ID-3456",
            "quantity": 300,
            "result": true
        }, {
            "id": "ID-4567",
            "quantity": 400,
            "result": false
        }]
    }
]
```

In this instance, include the [fixture](../test-api/test-code-structure.md#fixtures) method in the data set iteration and use `urlPath` and `initValue` in the fixture's parameters and [hooks](../test-api/test-code-structure.md#initialization-and-clean-up).

```js
const dataSet   = require('./data.json');
const PageModel = require('./page-model.js');
const page      = new PageModel();

dataSet.forEach(data => {
    fixture `Testing ${data.initValue} at ${data.urlPath}`
        .page `https://mycorp.com/${data.urlPath}`
        .beforeEach(async t => {
            await t
                .typeText(page.initValueInput, data.initValue)
                .click(page.button);
        });

    data.testCases.forEach(testcase => {
        test(`Check ID ${testcase.id}`, async t => {
            await t
                .typeText(page.idField, testcase.id)
                .typeText(page.quantityField, testcase.quantity)
                .click(page.submitButton)
                .expect(page.someElement.visible).eql(testcase.result);
        });
    });
});
```