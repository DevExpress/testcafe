---
layout: docs
title: Obtaining Data From the Client
permalink: /documentation/test-api/obtaining-data-from-the-client.html
---
# Obtaining Data From the Client

TestCafe allows you to create *client functions* that obtain arbitrary
serializable values from the client like the current URL
or custom data calculated by a client script.

> Important! Do not modify the tested webpage within client functions.
> To interact with the page, use [test actions](actions/index.md).

This topic contains the following sections:

* [Creating Client Functions](#creating-client-functions)
* [Executing Client Functions](#executing-client-functions)
* [Options](#options)
* [One-Time Client Code Execution](#one-time-client-code-execution)
* [Calling Client Functions from Node.js Callbacks](#calling-client-functions-from-nodejs-callbacks)
* [Limitations](#limitations)

## Creating Client Functions

To create a client function, use the `ClientFunction` constructor.

```text
ClientFunction( fn [, options] )
```

Parameter              | Type     | Description
---------------------- | -------- | ---------------------------------------------
`fn`                   | Function | A function to be executed on the client side.
`options` *(optional)* | Object   | See [Options](#options).

> Important! Client functions cannot return DOM nodes. Use [selectors](selecting-page-elements/selectors.md) for this.

The following example shows how to create a client function.

```js
import { ClientFunction } from 'testcafe';

const getWindowLocation = ClientFunction(() => window.location);
```

## Executing Client Functions

To execute a client function, call it with the `await` keyword.

```js
import { ClientFunction } from 'testcafe';

const getWindowLocation = ClientFunction(() => window.location);

fixture `My fixture`
    .page('http://www.example.com/');

test('My Test', async t => {
    const location = await getWindowLocation();
});
```

## Options

You can pass the following options to the
[ClientFunction constructor](#creating-client-functions) or the
[t.eval](#one-time-client-code-execution) function.
  
### options.dependencies

**Type**: Object

Contains functions, variables or objects used by the client function internally.
Properties of the `dependencies` object will be added to the client function's scope as variables.

The following sample demonstrates a client function (`getElemWidth`) that
internally calls a [selector](selecting-page-elements/selectors.md) (`getElemById`).
This selector is passed to `getElemWidth` as a dependency.

```js
import { Selector, ClientFunction } from 'testcafe';

const getElemById  = Selector(id => document.getElementById(id));
const getElemWidth = ClientFunction(id => getElemById(id).width, {
     dependencies: { getElemById }
});
```

> When a client function calls a [selector](selecting-page-elements/selectors.md) internally,
> the selector does not wait for the element to appear in the DOM
> but is executed at once, like a client function.

### options.boundTestRun

**Type**: Object

If you need to call a client function from a Node.js callback,
assign the current [test controller](test-code-structure.md#test-controller)
to the `boundTestRun` option.

For details, see [Calling Client Functions from Node.js Callbacks](#calling-client-functions-from-nodejs-callbacks).

### Overwriting Options

You can overwrite client function options by using the ClientFunction's `with` function.

```text
clientFunction.with( options ) → ClientFunction
```

`with` returns a new client function with a different set of options that includes options
from the original function and new `options` that overwrite the original ones.

The sample below shows how to overwrite the client function options to use a different selector.

```js
import { Selector, ClientFunction } from 'testcafe';

const getThirdElemByClass = Selector(cl => document.getElementsByClassName(cl), { index: 2 });
const getThirdElemWidth   = ClientFunction(cl => getElement(cl).width, {
     dependencies: { getElement: getThirdElemByClass }
});

const getFourthElemByClass = getThirdElemByClass.with({ index: 3 });
const getFourthElemWidth   = getThirdElemWidth.with({
    dependencies: { getElement: getFourthElemByClass }
});
```

## One-Time Client Code Execution

To create a client function and immediately execute it without saving,
use the `eval` method of the [test controller](test-code-structure.md#test-controller).

```text
t.eval( fn [, options] )
```

Parameter              | Type     | Description
---------------------- | -------- | --------------------------------------------------------------------------
`fn`                   | Function | A function to be executed on the client side.
`options` *(optional)* | Object   | See [Options](#options).

The following example shows how to get the document's URI with `t.eval`.

```js
fixture `My fixture`
    .page('http://www.example.com/');

test('My Test', async t => {
    const docURI = await t.eval(() => document.documentURI);
});
```

## Calling Client Functions from Node.js Callbacks

Client functions need access to the [test controller](test-code-structure.md#test-controller) to be executed.
When called right from the test function, they implicitly obtain the test controller.

However, if you need to call a client function from a Node.js callback that fires during the test run,
you will have to manually bind this function to the test controller.

Use the [boundTestRun](#optionsboundtestrun) option for this.

```js
import { fs } from 'fs';
import { expect } from 'chai';
import { ClientFunction } from 'testcafe';

fixture `My fixture`
    .page('http://www.example.com/');

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

    expect(equal).to.be.true;
});
```

This approach only works for Node.js callbacks that fire during the test run. To ensure that the test function
does not finish before the callback is executed, suspend the test until the callback fires. You can do this
by introducing a promise and synchronously waiting for it to complete as shown in the example above.

## Limitations

* You cannot use generators or `async/await` syntax within client functions.

* Client functions cannot access variables defined in the outer scope in test code.
  However, you can use arguments to pass data inside these functions, except for self-invoking functions
  that cannot take any parameters from the outside.
  
    Likewise, the return value is the only way to obtain data from client functions.