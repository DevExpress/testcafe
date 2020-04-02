---
layout: docs
title: Obtain Client-Side Info
permalink: /documentation/guides/basic-guides/obtain-client-side-info.html
---
# Obtain Data from the Client

TestCafe allows you to create [*Client Functions*](../../reference/test-api/global/clientfunction.md) that can return any serializable value from the client side, such as the current URL or custom data calculated by a client script.

> Do not modify the tested webpage within client functions.
> Use [test actions](interact-with-the-page.md) to interact with the page instead.

This topic contains the following sections.

* [Client Function Constructor](#client-function-constructor)
* [Run Asynchronous Client Code](#run-asynchronous-client-code)
* [Execute Client Functions](#execute-client-functions)
* [Overwrite Client Function Options](#overwrite-client-function-options)
* [One-Time Client Code Execution](#one-time-client-code-execution)
* [Import Functions to be Used as Client Function Dependencies](#import-functions-to-be-used-as-client-function-dependencies)
* [Calling Client Functions from Node.js Callbacks](#calling-client-functions-from-nodejs-callbacks)
* [Client Function Limitations](#client-function-limitations)

## Client Function Constructor

You can use the [ClientFunction](../../reference/test-api/global/clientfunction.md) constructor to create a client function.

```js
import { ClientFunction } from 'testcafe';
const getWindowLocation = ClientFunction(() => window.location);
```

> Client functions cannot return DOM nodes. Use [selectors](select-page-elements.md) to achieve this.

## Run Asynchronous Client Code

TestCafe allows you to create client functions that run asynchronous code.

You can pass a function that returns a Promise to the `ClientFunction` constructor to achieve this. In this instance, the client function will complete only when the Promise resolves.

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

## Overwrite Client Function Option

You can overwrite client function options with the ClientFunction's [`with`](../../reference/test-api/clientfunction/with.md) method.

```js
const cfWithDependency = cfWithoutDependency.with({
    dependencies: { foo: 'bar' }
});
```

## One-Time Client Code Execution

You can use the [`eval`](../../reference/test-api/testcontroller/eval.md) method of the [test controller](../../reference/test-api/testcontroller/README.md) to create a client function and execute it immediately without saving it.

```js
fixture `My fixture`
    .page `http://www.example.com/`;

test('My Test', async t => {
    const docURI = await t.eval(() => document.documentURI);
});
```

## Import Functions to be Used as Client Function Dependencies

Assume you have a JS file `utils.js` with a function you need to use as a client function dependency in your test file.

**utils.js**

```js
export function getDocumentURI() {
    return document.documentURI;
}
```

Note that TestCafe processes test files with [Babel](https://babeljs.io) internally. To avoid issues caused by code transpiling, use the [require](https://nodejs.org/api/modules.html#modules_require_id) function instead of the `import` statement to import client function dependencies.

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

Client functions need access to the [test controller](../../reference/test-api/testcontroller/README.md) to be executed.
When called right from the test function, they implicitly obtain the test controller.

However, if you need to call a client function from a Node.js callback that fires during the test run,
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

This approach only works for Node.js callbacks that fire during the test run. To ensure that the test function
does not finish before the callback does, suspend the test until the callback fires. You can introduce a promise and synchronously wait for it to complete as shown in the example above.

## Client Function Limitations

* You cannot use generators or `async/await` syntax within client functions.

* Client functions cannot access variables defined in the outer scope in test code.
  >You can use arguments to pass data inside these functions, except for self-invoking functions
  that cannot take any parameters from the outside.

    >The return value is the only way to obtain data from client functions.

