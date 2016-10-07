<h1 align="center">
    <a href="http://devexpress.github.io/testcafe">
        <img src="https://raw.github.com/DevExpress/testcafe/master/media/logo.png" alt="testcafe" />
    </a>
</h1>
<p align="center">
<a href="http://devexpress.github.io/testcafe">http://devexpress.github.io/testcafe</a>
</p>
<p align="center">
<i>Automated browser testing for the modern web development stack.</i>
</p>

<p align="center">
<a href="https://www.npmjs.com/package/testcafe"><img alt="NPM Version" src="https://img.shields.io/npm/v/testcafe.svg" data-canonical-src="https://img.shields.io/npm/v/testcafe.svg" style="max-width:100%;"></a>
</p>

----

TestCafe is a pure node.js solution for testing web apps. It takes care of all the stages: starting browsers, running tests, gathering test results and generating reports. TestCafe doesn’t need browser plugins - it works in all popular modern browsers out-of-the-box.

* [Build Status](#build-status)
* [Features](#features)
* [Getting Started](#getting-started)
* [Documentation](#documentation)
* [Contributing](#contributing)
* [Stay in Touch](#stay-in-touch)
* [License](#license)
* [Author](#author)

## Build Status

Tests             | Status
----------------- | ----------
All Travis tasks (server, client, functional: mobile, macOS, Edge)  | [![Travis CI Status](https://travis-ci.org/DevExpress/testcafe.svg)](https://travis-ci.org/DevExpress/testcafe)
Functional Windows desktop | [![AppVeyor status](https://ci.appveyor.com/api/projects/status/ftelkyuiji8lyadf?svg=true)](https://ci.appveyor.com/project/DevExpress/testcafe)
Client            | [![Sauce Test Status](https://saucelabs.com/browser-matrix/testcafe-master.svg)](https://saucelabs.com/u/testcafe-master)

## Features

### Easy Install

Everything is included in a single module installed with one command.

```bash
npm install -g testcafe
```

No native parts to compile, no browsers plugins to install.

### Complete Test Harness

TestCafe automatically starts browsers, runs tests and gathers results. You only type a single command to begin testing.

```bash
testcafe safari tests/
```

When testing is finished, TestCafe aggregates test results from different browsers and outputs them into one comprehensive report.

### Write Test Code Using ES2016

You can write TestCafe tests in ES2016 using the latest JavaScript features like `async/await`.

[Test API](http://devexpress.github.io/testcafe/documentation/test-api/index.html) consists of over two dozen methods that can emulate all actions one could possibly do with a webpage.
Chained syntax allows for code that is easy to write and read.

```js
import { expect } from 'chai';

fixture `Example page`
    .page('http://devexpress.github.io/testcafe/example');

test('Emulate user actions and perform a verification', async t => {
    await t
        .click('#send-button')
        .typeText('#input', 'Peter Parker')
        .wait(1000);

    expect(await t.eval(() => getSomethingOnTheClient())).to.be.true;
});
```

Additionally, TestCafe automatically generates source maps for easy debugging.
To debug your test code, start a debugging session in an IDE that supports source maps.

### Direct Access to Page Elements

TestCafe allows you to access webpage elements using standard CSS selectors or [custom selectors](http://devexpress.github.io/testcafe/documentation/test-api/selecting-page-elements/selectors.html) that run client JavaScript code.
You can call a custom selector as a regular function within your test.
It will execute your code on the client and pass the returned value back to the test.
This allows you to determine the state of each element on the tested page or select a proper element to perform an action on.

```js
import { Selector } from 'testcafe';

const getElementById = Selector(id => document.querySelector(`#${id}`));

fixture `Example page`
    .page('http://devexpress.github.io/testcafe/example');

test('Type the developer name, obtain the header text and check it', async t => {
    await t
        .typeText('#developer-name', 'John Smith')
        .click('#submit-button');

    const articleHeader = await getElementById('article-header');
    const headerText = articleHeader.innerText;

    expect(headerText).to.equal('Thank you, John!');
});
```

### No Extra Coding

Write tests without boilerplate code.

* TestCafe automatically waits for page loads and XHRs to complete, as well as for DOM elements to become visible. You do not need to write custom code for that.
* Test runs are isolated, which means that they do not share cookies, local or session storages. There is nothing to clean up between test runs.

### Descriptive Reports

TestCafe automatically generates full-detailed reports that provide a test run summary and comprehensive information about errors.
Automatic page screenshots, fancy call sites and call stacks free of TestCafe internals allow you to easily detect error causes.

Use one of [built-in reporters](http://devexpress.github.io/testcafe/documentation/using-testcafe/common-concepts/reporters.html) to output test results or [create your own one](http://devexpress.github.io/testcafe/documentation/extending-testcafe/custom-reporter-plugin/) to produce custom reports.

![Spec Report](docs/articles/images/spec-report.png)

### Straightforward Continuous Integration

TestCafe is easy to set up on popular Continuous Integration platforms as it allows you to test against various browsers: local, remote or cloud (e.g., [Sauce Labs](https://saucelabs.com/)).
You can also create a custom [browser provider](http://devexpress.github.io/testcafe/documentation/extending-testcafe/browser-provider-plugin/index.html) to add support for a browser or a cloud platform of your choice.

## Getting Started

### Installing TestCafe

Ensure that [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) are installed on your computer, then run a single command:

```bash
npm install -g testcafe
```

For more information, see [Installing TestCafe](http://devexpress.github.io/testcafe/documentation/using-testcafe/installing-testcafe.html).

### Creating a Test

To create a test, create a new .js file anywhere on your computer.
This file must have a special structure: tests must be organized into fixtures. Thus, begin by declaring a fixture using the [fixture](http://devexpress.github.io/testcafe/documentation/test-api/test-code-structure.md#fixtures) function.

```js
fixture `Getting Started`
```

In this tutorial, you will create a test for the [http://devexpress.github.io/testcafe/example](http://devexpress.github.io/testcafe/example) sample page.
Specify this page as a start page for the fixture by using the [page](http://devexpress.github.io/testcafe/documentation/test-api/test-code-structure.md#specifying-the-start-webpage) function.

```js
fixture `Getting Started`
    .page('http://devexpress.github.io/testcafe/example');
```

Then, create the [test](http://devexpress.github.io/testcafe/documentation/test-api/test-code-structure.md#tests) function where you will place test code.

```js
fixture `Getting Started`
    .page('http://devexpress.github.io/testcafe/example');

test('My first test', async t => {
    // Test code
});
```

### Running the Test

You can simply run the test from a command shell by calling a single command where you specify the [target browser](http://devexpress.github.io/testcafe/documentation/using-testcafe/command-line-interface.md#browser-list) and [file path](http://devexpress.github.io/testcafe/documentation/using-testcafe/command-line-interface.md#file-pathglob-pattern).

```bash
testcafe safari test1.js
```

TestCafe will automatically open the chosen browser and start test execution within it.

> Important! Make sure to keep the browser tab that is running tests active. Do not minimize the browser window.
> Inactive tabs and minimized browser windows switch to a lower resource consumption mode
> where tests are not guaranteed to execute correctly.

For more information on how to configure the test run, see [Command Line Interface](http://devexpress.github.io/testcafe/documentation/using-testcafe/command-line-interface.md).

### Viewing the Test Results

While the test is running, TestCafe is gathering information about the test run and outputing the report right into a command shell.

![Test Report](docs/articles/images/report.png)

For more information, see [Reporters](http://devexpress.github.io/testcafe/documentation/using-testcafe/common-concepts/reporters.md).

### Writing Test Code

#### Performing Actions on the Page

Every test should be capable of interacting with page content. To perform user actions, TestCafe provides
a number of [actions](http://devexpress.github.io/testcafe/documentation/test-api/actions/index.md): `click`, `hover`, `typeText`, `setFilesToUpload`, etc.
They can be called in a chain.

The following fixture contains a simple test that types a developer name into a text editor and then clicks the Submit button.

```js
fixture `Getting Started`
    .page('http://devexpress.github.io/testcafe/example');

test('My first test', async t => {
    await t
        .typeText('#developer-name', 'John Smith')
        .click('#submit-button');
});
```

All test actions are implemented as async functions of the [test controller object](http://devexpress.github.io/testcafe/documentation/test-api/test-code-structure.md#test-controller) `t`.
This object is used to access test run API.
To wait for actions to complete, use the `await` keyword when calling these actions or action chains.

#### Observing Page State

TestCafe allows you to observe the page state.
For this purpose, it offers special kinds of functions that will execute your code on the client:
[Selector](http://devexpress.github.io/testcafe/documentation/test-api/selecting-page-elements/selectors.md) used to get direct access to DOM elements
and [ClientFunction](http://devexpress.github.io/testcafe/documentation/test-api/obtaining-data-from-the-client.md) used to obtain arbitrary data from the client side.
You call these functions as regular async functions, that is you can obtain their results and use parameters to pass data to them.

For example, clicking the Submit button on the sample web page opens a "Thank you" page.
To get access to DOM elements on the opened page, the `Selector` function can be used.
The following example demonstrates how to access the article header element and obtain its actual text.

```js
import { Selector } from 'testcafe';

// Declare the parameterized Selector function
// to get access to a DOM element identified by the `id` attribute
const getElementById = Selector(id => document.getElementById(id));

fixture `Getting Started`
    .page('http://devexpress.github.io/testcafe/example');

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

For more information, see [Selecting Page Elements](http://devexpress.github.io/testcafe/documentation/test-api/selecting-page-elements/index.md).

#### Assertions

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

// Declare the parameterized selector function
// to obtain text content of an element identified by the `id` attribute
const getElementById = Selector(id => document.getElementById(id));

fixture `Getting Started`
    .page('http://devexpress.github.io/testcafe/example');

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

## Documentation

* [Test API](http://devexpress.github.io/testcafe/documentation/test-api/)
* [Using TestCafe](http://devexpress.github.io/testcafe/documentation/using-testcafe/)
* [Extending TestCafe](http://devexpress.github.io/testcafe/documentation/extending-testcafe/)
* [Recipes](http://devexpress.github.io/testcafe/documentation/recipes/)

## Contributing

Please use our [issues page](https://github.com/DevExpress/testcafe/issues) to report a bug or request a feature.

For general purpose questions and discussions, use the [discussion board](https://testcafe-discuss.devexpress.com/).

For more information on how to help us improve TestCafe, please see the [CONTRIBUTING.md](CONTRIBUTING.md) file.

## Stay in Touch

* [Blog](https://devexpress.github.io/testcafe/blog/)
* [Twitter](https://twitter.com/dxtestcafe)

## License

[MIT](LICENSE)

## Author

Developer Express Inc. ([https://devexpress.com](https://devexpress.com))
