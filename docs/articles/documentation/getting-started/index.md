---
layout: docs
title: Getting Started
permalink: /documentation/getting-started/
---
# Getting Started

This guide provides step-by-step instructions on how to create a functional web test with TestCafe and contains the following sections.

* [Installing TestCafe](#installing-testcafe)
* [Creating a Test](#creating-a-test)
* [Running the Test](#running-the-test)
* [Viewing the Test Results](#viewing-the-test-results)
* [Writing Test Code](#writing-test-code)
  * [Performing Actions on the Page](#performing-actions-on-the-page)
  * [Observing Page State](#observing-page-state)
  * [Assertions](#assertions)

## Installing TestCafe

Make sure that [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) are installed on your computer, then run a single command:

```bash
npm install -g testcafe
```

## Creating a Test

To create a test, create a new .js file anywhere on your computer.
This file must have the special structure: tests must be organized into fixtures. So, first you need to declare a fixture by using the [fixture](../test-api/test-code-structure.md#fixtures) function.

```js
fixture `Getting Started`
```

In this tutorial, you will create a test for the [http://testcafe.devexpress.com/example](http://testcafe.devexpress.com/example) sample page.
Specify this page as a start page for the fixture by using the [page](../test-api/test-code-structure.md#specifying-the-start-webpage) function.

```js
fixture `Getting Started`
    .page('http://testcafe.devexpress.com/example');
```

Then create the [test](../test-api/test-code-structure.md#tests) function where you will further place test code.

```js
fixture `Getting Started`
    .page('http://testcafe.devexpress.com/example');

test('My first test', async t => {
    // Test code
});
```

## Running the Test

You can simply run the test from a command shell, by calling a single command where you specify the [target browser](../using-testcafe/command-line-interface.md#browser-list) and [file path](../using-testcafe/command-line-interface.md#file-pathglob-pattern).

```bash
testcafe safari test1.js
```

TestCafe will automatically open the chosen browser and start the test execution within it.

For more information on how to configure the test run, see [Command Line Interface](../using-testcafe/command-line-interface.md).

## Viewing the Test Results

While the test is running, TestCafe is gathering information about the test run and outputing the report right into a command shell.

![Test Report](../../images/report.png)

For more information, see [Reporters](../using-testcafe/common-concepts/reporters.md).

## Writing Test Code

### Performing Actions on the Page

Every test should be capable of interacting with a page content. To perform user actions, TestCafe provides a number of [actions](../test-api/actions.md): `click`, `hover`, `typeText`, `setFilesToUpload`, etc.
They can be called in a chain.

The following fixture contains a simple test that types a developer name into a text editor and then clicks the Submit button.

```js
fixture `Getting Started`
    .page('http://testcafe.devexpress.com/example');

test('My first test', async t => {
    await t
        .typeText('#developer-name', 'John Smith')
        .click('#submit-button');
});
```

All test actions are implemented as async functions of the [test controller object](../test-api/test-code-structure.md#test-controller) `t`. This object is used to access test run API.
To wait for actions to be complete, use the `await` keyword when calling these actions or action chains.

### Observing Page State

TestCafe allows you to observe the page state.
For this purpose, it offers special kinds of functions that will execute your code on the client: [Selector](../test-api/executing-client-code/index.md#selector-functions) used to get direct access to DOM elements
and [ClientFunction](../test-api/executing-client-code/index.md#client-functions) used to obtain arbitrary data from the client side.
You call these functions as regular async functions, that is you can obtain their results and use parameters to pass data to them.

For example, clicking the Submit button on the sample web page opens a "Thank you" page.
To get access to DOM elements on the opened page, the `Selector` function can be used.
The following example demonstrates how to access the article header element and obtain its actual text.

```js
import { Selector } from 'testcafe';

// Declare the parameterized Selector function
// to get access to a DOM element identified by the `id` attribute
const getElementById = Selector(id => document.querySelector(`#${id}`));

fixture `Getting Started`
    .page('http://testcafe.devexpress.com/example');

test('My first test', async t => {
    await t
        .typeText('#developer-name', 'John Smith')
        .click('#submit-button');

    // Use the Selector function to get access to the article header
    const articleHeader = await getElementById('article-header');

    // Obtain the text of the article header
    const headerText = articleHeader.innerText;
});
```

For more information, see [Executing Client Code](../test-api/executing-client-code/index.md).

### Assertions

A functional test also should check the result of actions performed.
For example, the article header on the "Thank you" page should address a user by the entered name.
To check if the header is correct, you have to add an assertion to the test.

You can use assertions from Node's built-in [assert](https://nodejs.org/api/assert.html) module or from any third-party assertion library.
Before calling assertions, make sure an assertion library is installed into your project.

The following test demonstrates how to use an assertion from [Chai Assertion Library](http://chaijs.com/api/bdd/).
Before running the test, install the assertion library by calling the `npm install --save-dev chai` command.

```js
import { expect } from 'chai';
import { Selector } from 'testcafe';

// Declare the parameterized hybrid function
// to obtain text content of an element identified by the `id` attribute
const getElementById = Selector(id => document.querySelector(`#${id}`));

fixture `Getting Started`
    .page('http://testcafe.devexpress.com/example');

test('My first test', async t => {
    await t
        .typeText('#developer-name', 'John Smith')
        .click('#submit-button');

    // Use the Selector function to get access to the article header
    const articleHeader = await getElementById('article-header');

    // Use the assertion to check if the actual header text is equal to the expected one
    expect(articleHeader.innerText).to.equal('Thank you, John Smith!');
});
```