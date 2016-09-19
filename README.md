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

TestCafe is a simple and powerful framework for testing websites and web apps.
It allows you to easily create, maintain and execute automated web tests across browsers, operating systems and devices.

* [Build status](#build-status)
* [Features](#features)
* [Getting Started](#getting-started)
* [Documentation](#documentation)
* [Contributing](#contributing)
* [License](#license)
* [Author](#author)

## Build status

Tests             | Status
----------------- | ----------
All Travis tasks (server, client, functional: mobile, macOS, Edge)  | [![Travis CI Status](https://travis-ci.org/DevExpress/testcafe.svg)](https://travis-ci.org/DevExpress/testcafe)
Functional Windows desktop | [![AppVeyor status](https://ci.appveyor.com/api/projects/status/ftelkyuiji8lyadf?svg=true)](https://ci.appveyor.com/project/DevExpress/testcafe)
Client            | [![Sauce Test Status](https://saucelabs.com/browser-matrix/testcafe-master.svg)](https://saucelabs.com/u/testcafe-master)

## Features

### Easy Install

All you need is to have [Node.js](https://nodejs.org) with [npm](https://www.npmjs.com) installed and call a single command.

```bash
npm install -g testcafe
```

No browsers plugins to install, no binary compilation post-install steps.

### Complete Test Harness

TestCafe covers all testing phases: starting browsers, running tests and gathering results.
You configure test run and start execution either via the API or from a command shell simply by running a single command

```bash
testcafe safari tests/
```

TestCafe aggregates test results from different browsers and outputs them into one comprehensive report.

### Write Test Code Using ES2016

You can write TestCafe tests in ES2016 using all latest JavaScript features like `async/await`.

TestCafe introduces simple, but powerful test API. It offers a couple of dozen methods covering user actions. Chained syntax produces code that is easy to write and read. Furthermore, you are free to use any assertion library to perform verifications of different kinds.

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

TestCafe will compile your test code on-flight and run it immediately.
It also ships with built-in support for source maps to leverage debugging experience.
Source maps are automatically enabled, so all you need to do is start a debugging session in an IDE that supports them.

### Write Regular Client JavaScript to Observe Page State

TestCafe is capable of executing code on the client side thus giving you direct access to DOM elements on the page and empowering you to obtain required data from the client.
Simply write JavaScript code within the `ClientFunction` or `Selector` function.
These functions are called from a test as regular async functions. So, you can pass parameters to them and return values.

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

TestCafe keeps your tests clear of boilerplate code.

* It automatically waits for page loads, XHRs and DOM elements to be visible. Thus, there is no need to write custom code to process these tasks.
* Test runs are isolated, they don't share cookies and local/session storage values, that means nothing to clean up before each test run.

### Descriptive Reports

TestCafe automatically generates full-detailed reports providing a test run summary and comprehensive information about errors.
Fancy call sites, clean stacks and screenshots help you easily detect an error cause.

Choose from five [built-in reporters](http://devexpress.github.io/testcafe/documentation/using-testcafe/common-concepts/reporters.html) to output test results or create [custom reporter plugins](http://devexpress.github.io/testcafe/documentation/extending-testcafe/custom-reporter-plugin/) to produce your own reports.

![Spec Report](docs/articles/images/spec-report.png)

### Continuous Integration

Take advantage of automatic test execution through integration of TestCafe with popular Continuous Integration platforms.
TestCafe's browser provider mechanism makes it simple to set up testing in various browsers: local, remote, [Sauce Labs](https://saucelabs.com/) or [PhantomJS](http://phantomjs.org/).
You can also create your own browser provider plugin that will suit your platform and needs.

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

## License

[MIT](LICENSE)

## Author

Developer Express Inc. ([https://devexpress.com](https://devexpress.com))
