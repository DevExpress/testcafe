---
layout: docs
title: Obtain Client-Side Info
permalink: /documentation/guides/basic-guides/obtain-client-side-info.html
redirect_from:
  - /documentation/test-api/obtaining-data-from-the-client.html
  - /documentation/test-api/obtaining-data-from-the-client/
  - /documentation/test-api/obtaining-data-from-the-client/examples-of-using-client-functions.html
  - /documentation/test-api/accessing-console-messages.html
---
# Obtain Client-Side Info

TestCafe allows you to create *client functions* that can return any serializable value from the client side, such as the current URL or custom data calculated by a client script.

* [Client Function Constructor](#client-function-constructor)
* [Run Asynchronous Client Code](#run-asynchronous-client-code)
* [Execute Client Functions](#execute-client-functions)
* [Overwrite Client Function Options](#overwrite-client-function-options)
* [One-Time Client Code Execution](#one-time-client-code-execution)
* [Import Functions to be Used as Client Function Dependencies](#import-functions-to-be-used-as-client-function-dependencies)
* [Call Client Functions from Node.js Callbacks](#call-client-functions-from-nodejs-callbacks)
* [Client Function Limitations](#client-function-limitations)
* [Access Console Messages](#access-console-messages)
* [Examples](#examples)

> Do not modify the tested webpage within client functions.
> Use [test actions](interact-with-the-page.md) to interact with the page instead.

## Client Function Constructor

Use the [ClientFunction](../../reference/test-api/clientfunction/constructor.md) constructor to create a client function.

```js
import { ClientFunction } from 'testcafe';
const getWindowLocation = ClientFunction(() => window.location);
```

> Client functions cannot return DOM nodes. Use [selectors](select-page-elements.md) instead.

## Run Asynchronous Client Code

TestCafe allows you to create client functions that run asynchronous code.

Pass a function that returns a Promise to the `ClientFunction constructor`. In this instance, the client function will complete only when the Promise resolves.

```js
import { ClientFunction } from 'testcafe';

const performAsyncOperation = ClientFunction(() => {
    return new Promise(resolve => {
        window.setTimeout(resolve, 500); // some async operations
    });
});
```

## Execute Client Functions

Call the client function with the `await` keyword to execute it.

```js
import { ClientFunction } from 'testcafe';

const getWindowLocation = ClientFunction(() => window.location);

fixture `My fixture`
    .page `http://www.example.com/`;

test('My Test', async t => {
    const location = await getWindowLocation();
});
```

## Overwrite Client Function Options

Overwrite client function options via the ClientFunction's [with](../../reference/test-api/clientfunction/with.md) method.

```js
const cfWithDependency = cfWithoutDependency.with({
    dependencies: { foo: 'bar' }
});
```

## One-Time Client Code Execution

To create a client function and execute it immediately (without saving), use the test controller's [eval](../../reference/test-api/testcontroller/eval.md) method.

```js
fixture `My fixture`
    .page `http://www.example.com/`;

test('My Test', async t => {
    const docURI = await t.eval(() => document.documentURI);
});
```

## Import Functions to be Used as Client Function Dependencies

Assume you have a JS file (`utils.js`) with a function to be used as a client-function dependency in your test file.

**utils.js**

```js
export function getDocumentURI() {
    return document.documentURI;
}
```

Note that TestCafe processes test files with [Babel](https://babeljs.io) internally. To avoid code transpiling issues, use the [require](https://nodejs.org/api/modules.html#modules_require_id) function instead of the `import` statement to import client function dependencies.

**test.js**

```js
import { ClientFunction } from 'testcafe';

const getDocumentURI = require('./utils.js').getDocumentURI;

fixture `My fixture`
    .page `http://devexpress.github.io/testcafe/example/`;

test('My test', async t => {
    const getUri = ClientFunction(() => {
        return getDocumentURI();
    }, { dependencies: { getDocumentURI } });

    const uri = await getUri();

    await t.expect(uri).eql('http://devexpress.github.io/testcafe/example/');
});
```

## Call Client Functions from Node.js Callbacks

Client functions need access to the [test controller](../../reference/test-api/testcontroller/README.md) to be executed. When called directly from a test function, they implicitly obtain the test controller.

However, if you need to call a client function from a Node.js callback that fires during a test run,
you need to manually bind this function to the test controller.

You can use the `boundTestRun` option to do this.

```js
import fs from 'fs';
import { ClientFunction } from 'testcafe';

fixture `My fixture`
    .page `http://www.example.com/`;

const getDataFromClient = ClientFunction(() => getSomeData());

test('Check client data', async t => {
    const boundGetDataFromClient = getDataFromClient.with({ boundTestRun: t });

    const equal = await new Promise(resolve => {
        fs.readFile('/home/user/tests/reference/clientData.json', (err, data) => {
            boundGetDataFromClient().then(clientData => {
                resolve(JSON.stringify(clientData) === data);
            });
        });
    });

    await t.expect(equal).ok();
});
```

This approach only works for Node.js callbacks that fire during a test run. To ensure that the test function
does not finish before the callback, suspend the test until the callback fires. You can introduce a promise and synchronously wait for it to complete, as shown in the example above.

## Client Function Limitations

* You cannot use generators or `async/await` syntax within client functions.

* Client functions cannot access variables defined in the outer scope.

  > You can use arguments to pass data within these functions, except for self-invoking functions that do not accept outside parameters.
  >
  > The return value is the only way to obtain data from client functions.

## Access Console Messages

The tested web application or a framework it uses may output log, warning, error and information messages into the browser console. TestCafe allows you to access them from test code with the [t.getBrowserConsoleMessages](../../reference/test-api/testcontroller/getbrowserconsolemessages.md) method.

For instance, consider the React's typechecking feature, [PropTypes](https://reactjs.org/docs/typechecking-with-proptypes.html). You can use it to check that you assign valid values to the component's props. If a `PropTypes` rule is violated, React posts an error into the JavaScript console.

The following example shows how to check the React prop types for errors with the [t.getBrowserConsoleMessages](../../reference/test-api/testcontroller/getbrowserconsolemessages.md) method.

```js
// check-prop-types.js
import { t } from 'testcafe';

export default async function () {
    const { error } = await t.getBrowserConsoleMessages();

    await t.expect(error[0]).notOk();
}

// test.js
import { Selector } from 'testcafe';
import checkPropTypes from './check-prop-types';

fixture `react example`
    .page `http://localhost:8080/`  // https://github.com/mzabriskie/react-example
    .afterEach(() => checkPropTypes());

test('test', async t => {
    await t
        .typeText(Selector('.form-control'), 'devexpress')
        .click(Selector('button').withText('Go'))
        .click(Selector('h4').withText('Organizations'));
});
```

## Examples

### Check a Page URL

When performing certain actions on a tested web page (clicking buttons or links), it can redirect a browser to another page and you need to check if the desired page is open. For example, you are testing your web application's login form and need to verify if a particular web page opens after a user logs in.

You can create a client function and use the [window.location.href](https://www.w3schools.com/jsref/prop_loc_href.asp) property within it to return the URL of a page that is open on the client and then verify if the actual page URL matches the expected one using an [assertion](assert.md). The sample below demonstrates how to do this.

```js
import { ClientFunction } from 'testcafe';

fixture `My Fixture`
    .page `http://devexpress.github.io/testcafe/example`;

//Returns the URL of the current web page
const getPageUrl = ClientFunction(() => window.location.href);

test('Check the page URL', async t => {
    await t
        .typeText('#developer-name', 'John Smith')
        .click('#submit-button') //Redirects to the 'Thank you' page
        .expect(getPageUrl()).contains('thank-you'); //Checks if the current page URL contains the 'thank-you' string
});
```

### Obtain a Browser Alias Within a Test

Sometimes you may need to determine a browser's alias from within a test. For example, you configured a test tasks using the [testCafe.createRunner](../../reference/testcafe-api/testcafe/createrunner.md) function and specified several browsers where the test should run: `runner.browsers(['safari','chrome'])`. However, the test logic should be different for different browsers. To do this, you need to detect which test instance corresponds to `safari` and which one corresponds to `chrome`.

To obtain a browser's alias, create a client function that uses the [navigator.userAgent](https://www.w3schools.com/jsref/prop_nav_useragent.asp) property. This function returns the browser's user-agent header, and you can use external modules (for example, [ua-parser-js](https://github.com/faisalman/ua-parser-js)) to parse this header.

The following sample demonstrates how to create a conditional test logic based on the browser. Before running this test, install *ua-parser-js* by running `npm install ua-parser-js`.

```js
import { ClientFunction } from 'testcafe';
import uaParser from 'ua-parser-js';

fixture `My fixture`
    .page `http://example.com`;

//Returns a user-agent header sent by the browser
const getUA = ClientFunction(() => navigator.userAgent);

test('My test', async t => {
    const ua = await getUA();
    const browserAlias =uaParser(ua).browser.name;

    //Some common actions

    //Conditional logic
    if (browserAlias === 'Chrome'){
        //Test logic for Chrome
        console.log('The browser is Chrome');
    }
    else if (browserAlias === 'Safari'){
        //Test logic for Safari
        console.log('The browser is Safari');
    }
});
```

### Complex DOM Queries

Client functions can be helpful for complex DOM queries. For example, a tested page contains a table with some data, and you need to validate data from two columns only. To do this, obtain data from these columns, push them to an array and then compare the returned array with the expected one.

Below is a sample test for the [https://js.devexpress.com/](https://js.devexpress.com/) page that contains a grid. The sample demonstrates how to create a client function that returns an array containing data from the grid’s **Customer** and **Sale Amount** columns.

```js
import { ClientFunction } from 'testcafe';

fixture `Get sale amount`
    .page('https://js.devexpress.com/');

    const getSalesAmount = ClientFunction(() => {
        const grid      = document.querySelector('.dx-datagrid-rowsview');
        const rowCount  = grid.querySelectorAll('.dx-data-row').length;
        const sales     = grid.querySelectorAll('td:nth-child(3)');
        const customers = grid.querySelectorAll('td:nth-child(7)');

        const array = [];

        for (let i = 0; i < rowCount; i++) {
            array.push({
                sales: sales[i].textContent,
                customer: customers[i].textContent
            });
        }

        return array;
    });

test('My test', async t => {
    await t
        .expect(getSalesAmount()).eql([
            { sales: '$6,370', customer: 'Renewable Supplies' },
            { sales: '$4,530', customer: 'Apollo Inc' },
            { sales: '$1,110', customer: 'Johnson & Assoc' },
            { sales: '$6,600', customer: 'Global Services' },
            { sales: '$2,830', customer: 'Health Plus Inc' },
            { sales: '$6,770', customer: 'Gemini Stores' },
            { sales: '$1,460', customer: 'Discovery Systems' }
        ]);
});
```

You can use [TestCafe selectors](select-page-elements.md) instead of the native `querySelector` and `querySelectorAll` methods. Pass these selectors to the client function's [dependencies](../../reference/test-api/clientfunction/constructor.md#optionsdependencies) option and call them as regular functions. You can use chains of [selector methods](select-page-elements.md#member-tables) instead of complex CSS strings for more transparent syntax.
