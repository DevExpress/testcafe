---
layout: docs
title: Test Code Structure
permalink: /documentation/test-api/test-code-structure.html
checked: true
---
# Test Code Structure

This topic contains the following sections.

* [Fixtures](#fixtures)
* [Tests](#tests)
  * [Test Controller](#test-controller)
* [Specifying the Start Webpage](#specifying-the-start-webpage)
* [Initialization and Clean-Up](#initialization-and-clean-up)
  * [Sharing Variables Between the Hooks and Test Code](#sharing-variables-between-the-hooks-and-test-code)
* [Skipping Tests](#skipping-tests)

> If you use [eslint](http://eslint.org/) in your project, get the [TestCafe plugin](https://www.npmjs.com/package/eslint-plugin-testcafe)
to avoid the `'fixture' is not defined` and `'test' is not defined` errors.

## Fixtures

TestCafe tests must be organized into categories called *fixtures*.
A JavaScript file with TestCafe tests can contain one or more fixtures.

To declare a test fixture, use the `fixture` function.

```text
fixture( fixtureName )
fixture `fixtureName`
```

Parameter     | Type   | Description
------------- | ------ | ------------------------
`fixtureName` | String | The name of the fixture.

This function returns the `fixture` object that allows you to configure the fixture - specify the [start webpage](#specifying-the-start-webpage) and [initialization and clean-up code](#initialization-and-clean-up) for tests included to the fixture.

> [Tests](#tests) that constitute a fixture go after this declaration.

## Tests

To introduce a test, call the `test` function and pass test code inside.

```text
test( testName, fn(t) )
```

Parameter  | Type     | Description
---------- | -------- | --------------------------------------------------------------------
`testName` | String   | The test name.
`fn`       | Function | An asynchronous function that contains test code.
`t`        | Object   | The [test controller](#test-controller) used to access test run API.

```js
fixture `MyFixture`;

test('Test1', async t => {
    /* Test 1 Code */
});

test('Test2', async t => {
    /* Test 2 Code */
});
```

You are free to structure test code in any manner, and you can
reference any modules or libraries you need.

TestCafe tests are executed server side. To manipulate the tested webpage, use [test actions](actions/index.md).
To determine the state of page elements or obtain any other data from the client side, use [selectors](selecting-page-elements/selectors.md) and
[client functions](obtaining-data-from-the-client.md).

To check if the page state matches the expected one, use [assertions](assertions/index.md).

### Test Controller

A *test controller* object `t` exposes methods of test API. That is why it is
passed to each function that is expected to contain server-side test code (like [test](#tests),
[beforeEach](#initialization-and-clean-up) or [afterEach](#initialization-and-clean-up)).

Use the test controller to call [test actions](actions/index.md), handle [browser dialogs](handling-native-dialogs.md),
use the [wait function](pausing-the-test.md) or [execute assertions](assertions/index.md).

```js
fixture `My fixture`
    .page `http://www.example.com/`;

test('My Test', async t => {
    await t
        .setNativeDialogHandler(() => true)
        .click('#populate')
        .click('#submit-button');

    const location = await t.eval(() => window.location);

    await t.expect(location.pathname).eql('/testcafe/example/thank-you.html');
});
```

Another job of the test controller is providing access to the internal context required for test API to operate.
This is why [selectors](selecting-page-elements/selectors.md) and
[client functions](obtaining-data-from-the-client.md) need the test controller object when they are
called from Node.js callbacks.

#### Using Test Controller Outside of Test Code

You may sometimes need to call test API from outside of test code. For instance, your [page model](../recipes/using-page-model.md)
can contain methods that perform common operations used in many tests, like authentication.

```js
export default class Page {
    constructor () {
        this.loginInput    = Selector('#login');
        this.passwordInput = Selector('#password');
        this.signInButton  = Selector('#sign-in-button');
        /* ... */
    }
    async login () {
        // await t
        //     .typeText(this.loginInput, 'MyLogin')
        //     .typeText(this.passwordInput, 'Pa$$word')
        //     .click(this.signInButton);
    }
}
```

In this instance, you need to access the test controller from the page model's `login` method.

TestCafe allows you to avoid passing the test controller to the method explicitly.
Instead, you can simply import `t` to the page model file.

```js
import { t } from 'testcafe';

export default class Page {
    constructor () {
        this.loginInput    = Selector('#login');
        this.passwordInput = Selector('#password');
        this.signInButton  = Selector('#sign-in-button');
        /* ... */
    }
    async login () {
        await t
            .typeText(this.loginInput, 'MyLogin')
            .typeText(this.passwordInput, 'Pa$$word')
            .click(this.signInButton);
    }
}
```

TestCafe will implicitly resolve test context and provide the right test controller.

## Specifying the Start Webpage

You can specify a webpage at which all tests in a fixture start.
To do this, use the `fixture.page` function.

```text
fixture.page( url )
fixture.page `url`
```

Similarly, you can specify a start page for individual tests
using the `test.page` function that overrides `fixture.page`.

```text
test.page( url )
test.page `url`
```

Parameter | Type   | Description
--------- | ------ | ------------------------------------------------
`url`     | String | The URL of the webpage at which this test starts.

```js
fixture `MyFixture`
    .page `http://devexpress.github.io/testcafe/example`;

test('Test1', async t => {
    // Starts at http://devexpress.github.io/testcafe/example
});

test
    .page `http://devexpress.github.io/testcafe/blog/`
    ('Test2', async t => {
        // Starts at http://devexpress.github.io/testcafe/blog/
    });
```

If the start page is not specified, it defaults to `about:blank`.

## Initialization and Clean-Up

You can provide initialization code that will be executed before each test starts and clean-up code that will executed after the test finishes.
To do this, add the `beforeEach` and `afterEach` *hook functions* to the [fixture declaration](#fixtures).

```text
fixture.beforeEach( fn(t) )
```

```text
fixture.afterEach( fn(t) )
```

You can also specify initialization and clean-up logic for an individual test by using the `test.before` and `test.after` hooks.

```text
test.before( fn(t) )
```

```text
test.after( fn(t) )
```

> If `test.before` or `test.after` is specified, it overrides the corresponding
> `fixture.beforeEach` and `fixture.afterEach` method, so that fixture's methods are not executed.

The `test.before`, `test.after`,  `fixture.beforeEach` and `fixture.afterEach` methods take the following parameters.

Parameter | Type     | Description
--------- | -------- | ---------------------------------------------------------------------------
`fn`      | Function | An asynchronous function that contains initialization or clean-up code.
`t`       | Object   | The [test controller](#test-controller) used to access test run API.

As long as the function you provide receives a [test controller](#test-controller),
you can use [test actions](actions/index.md) and other test run API inside the `test.before`, `test.after`,  `fixture.beforeEach` and `fixture.afterEach` functions.

```js
fixture `My fixture`
    .page `http://example.com`
    .beforeEach( async t => {
        /* test initialization code */
    })
    .afterEach( async t => {
        /* test finalization code */
    });

test
    .before( async t => {
        /* test initialization code */
    })
    ('MyTest', async t => { /* ... */ })
    .after( async t => {
        /* test finalization code */
    });
```

### Sharing Variables Between the Hooks and Test Code

You can share variables between `fixture.beforeEach`, `fixture.afterEach`, `test.before`, `test.after` functions and test code
by using the *test context* object.

Test context is available through the `t.ctx` property.

```text
t.ctx
```

Instead of using a global variable, assign the object you want to share directly to `t.ctx` or create a property like in the following example.

```js
fixture `Fixture1`
    .beforeEach(async t  => {
        t.ctx.someProp = 123;
    });

test
    ('Test1', async t => {
        console.log(t.ctx.someProp); // > 123
    })
    .after(async t => {
         console.log(t.ctx.someProp); // > 123
    });
```

Each test run has its own test context.

> `t.ctx` is initialized with an empty object without a prototype. You can iterate its keys without the `hasOwnProperty` check.

## Skipping Tests

TestCafe allows you to specify that a particular test or fixture should be skipped when running tests.
Use the `fixture.skip` and `test.skip` methods for this.

```text
fixture.skip
```

```text
test.skip
```

You can also use the `only` method to specify that only a particular test or fixture should run while all others should be skipped.

```text
fixture.only
```

```text
test.only
```

If several tests or fixtures are marked with `only`, all the marked tests and fixtures will run.

**Examples**

```js
fixture.skip `Fixture1`; // All tests in this fixture will be skipped

test('Fixture1Test1', () => {});
test('Fixture1Test2', () => {});

fixture `Fixture2`;

test('Fixture2Test1', () => {});
test.skip('Fixture2Test2', () => {}); // This test will be skipped
test('Fixture2Test3', () => {});
```

```js
fixture.only `Fixture1`;
test('Fixture1Test1', () => {});
test('Fixture1Test2', () => {});

fixture `Fixture2`;

test('Fixture2Test1', () => {});
test.only('Fixture2Test2', () => {});
test('Fixture2Test3', () => {});

// Only tests in Fixture1 and the Fixture2Test2 test will run
```