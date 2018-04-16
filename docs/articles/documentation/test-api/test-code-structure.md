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
  * [Setting Test Speed](#setting-test-speed)
  * [Setting Page Load Timeout](#setting-page-load-timeout)
* [Specifying the Start Webpage](#specifying-the-start-webpage)
* [Initialization and Clean-Up](#initialization-and-clean-up)
  * [Test Hooks](#test-hooks)
    * [Sharing Variables Between Test Hooks and Test Code](#sharing-variables-between-test-hooks-and-test-code)
  * [Fixture Hooks](#fixture-hooks)
    * [Sharing Variables Between Fixture Hooks and Test Code](#sharing-variables-between-fixture-hooks-and-test-code)
* [Skipping Tests](#skipping-tests)

> If you use [eslint](http://eslint.org/) in your project, get the [TestCafe plugin](https://www.npmjs.com/package/eslint-plugin-testcafe)
to avoid the `'fixture' is not defined` and `'test' is not defined` errors.

## Fixtures

TestCafe tests must be organized into categories called *fixtures*.
A JavaScript or TypeScript file with TestCafe tests can contain one or more fixtures.

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

TestCafe tests are executed server side. To manipulate the tested webpage, use [test actions](actions/README.md).
To determine the state of page elements or obtain any other data from the client side, use [selectors](selecting-page-elements/selectors/README.md) and
[client functions](obtaining-data-from-the-client/README.md).

To check if the page state matches the expected one, use [assertions](assertions/README.md).

### Test Controller

A *test controller* object `t` exposes methods of test API. That is why it is
passed to each function that is expected to contain server-side test code (like [test](#tests),
[beforeEach](#initialization-and-clean-up) or [afterEach](#initialization-and-clean-up)).

Use the test controller to call [test actions](actions/README.md), handle [browser dialogs](handling-native-dialogs.md),
use the [wait function](pausing-the-test.md) or [execute assertions](assertions/README.md).

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
This is why [selectors](selecting-page-elements/selectors/README.md) and
[client functions](obtaining-data-from-the-client/README.md) need the test controller object when they are
called from Node.js callbacks.

#### Using Test Controller Outside of Test Code

You may sometimes need to call test API from outside of test code. For instance, your [page model](../recipes/using-page-model.md)
can contain methods that perform common operations used in many tests, like authentication.

```js
import { Selector } from 'testcafe';

export default class Page {
    constructor () {
        this.loginInput    = Selector('#login');
        this.passwordInput = Selector('#password');
        this.signInButton  = Selector('#sign-in-button');
    }
    async login (t) {
        await t
            .typeText(this.loginInput, 'MyLogin')
            .typeText(this.passwordInput, 'Pa$$word')
            .click(this.signInButton);
    }
}
```

In this instance, you need to access the test controller from the page model's `login` method.

TestCafe allows you to avoid passing the test controller to the method explicitly.
Instead, you can simply import `t` to the page model file.

```js
import { Selector, t } from 'testcafe';

export default class Page {
    constructor () {
        this.loginInput    = Selector('#login');
        this.passwordInput = Selector('#password');
        this.signInButton  = Selector('#sign-in-button');
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

### Setting Test Speed

TestCafe allows you to specify the speed of test execution.

By default, tests run at the maximum speed. However, if you need to watch a test running
to understand what happens in it, this speed may seem too fast. In this instance, use the `t.setTestSpeed` method
to slow the test down.

```text
t.setTestSpeed( factor )
```

Parameter  | Type      | Description
---------- | --------- | -----------
`factor`   | Number    | Specifies the test speed. Must be a number between `1` (the fastest) and `0.01` (the slowest).

If speed is also specified for an [individual action](actions/action-options.md#basic-action-options), the action speed setting overrides test speed.

**Example**

```js
import { Selector } from 'testcafe';

fixture `Test Speed`
    .page `http://devexpress.github.io/testcafe/example/`;

const nameInput = Selector('#developer-name');

test(`Test Speed`, async t => {
    await t
        .typeText(nameInput, 'Peter')
        .setTestSpeed(0.1)
        .typeText(nameInput, ' Parker');
});
```

### Setting Page Load Timeout

Page load timeout defines the amount of time passed after the `DOMContentLoaded` event, within which the `window.load` event should be raised.

After the timeout passes or the `window.load` event is raised (whichever happens first), TestCafe starts the test.

To specify the page load timeout in test code, use the `t.setPageLoadTimeout` method.

```text
t.setPageLoadTimeout( duration )
```

Parameter  | Type      | Description
---------- | --------- | -----------
`duration` | Number    | Page load timeout, in milliseconds. `0` to skip waiting for the `window.load` event.

You can also set the page load timeout when launching tests via the [command line](../using-testcafe/command-line-interface.md#--page-load-timeout-ms) or [API](../using-testcafe/programming-interface/runner.md#run).

**Example**

```js
fixture `Page load timeout`
    .page `http://devexpress.github.io/testcafe/example/`;

test(`Page load timeout`, async t => {
    await t
        .setPageLoadTimeout(0)
        .navigateTo('http://devexpress.github.io/testcafe/');
});
```

> Note that the `DOMContentLoaded` event is raised after the HTML document is loaded and parsed, while `window.load` is raised after all stylesheets, images and subframes are loaded. That is why `window.load` is fired after the `DOMContentLoaded` event with a certain delay.

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

To test webpages in local directories, you can use the `file://` scheme or relative paths.

```js
fixture `MyFixture`
    .page `file:///user/my-website/index.html`;
```

```js
fixture `MyFixture`
    .page `../my-project/index.html`;
```

## Initialization and Clean-Up

TestCafe allows you to specify functions that will be executed before a fixture or test is started and after it is finished.
These functions are called *hook functions* or *hooks*.

### Test Hooks

Test hooks are executed in each test run before a test is started and after it is finished. If a test runs in several browsers, test hooks are executed in each browser.

At the moment test hooks run, the tested webpage is already loaded, so that you can use [test actions](actions/README.md) and other test run API inside test hooks.

You can specify a hook for each test in a fixture by using the `beforeEach` and `afterEach` methods in the [fixture declaration](#fixtures).

```text
fixture.beforeEach( fn(t) )
```

```text
fixture.afterEach( fn(t) )
```

You can also specify hooks for an individual test by using the `test.before` and `test.after` methods.

```text
test.before( fn(t) )
```

```text
test.after( fn(t) )
```

> If `test.before` or `test.after` is specified, it overrides the corresponding
> `fixture.beforeEach` and `fixture.afterEach` hook, so that the latter are not executed.

The `test.before`, `test.after`,  `fixture.beforeEach` and `fixture.afterEach` methods take the following parameters.

Parameter | Type     | Description
--------- | -------- | ---------------------------------------------------------------------------
`fn`      | Function | An asynchronous hook function that contains initialization or clean-up code.
`t`       | Object   | The [test controller](#test-controller) used to access test run API.

**Example**

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

#### Sharing Variables Between Test Hooks and Test Code

You can share variables between test hook functions and test code
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

### Fixture Hooks

Fixture hooks are executed before the first test in a fixture is started and after the last test is finished.

Unlike [test hooks](#test-hooks), fixture hooks are executed between test runs and do not have access to the tested page.
Use them to perform server-side operations like preparing the server that hosts the tested app.

To specify fixture hooks, use the `fixture.before` and `fixture.after` methods.

```text
fixture.before( fn(ctx) )
```

```text
fixture.after( fn(ctx) )
```

Parameter | Type     | Description
--------- | -------- | ---------------------------------------------------------------------------
`fn`      | Function | An asynchronous hook function that contains initialization or clean-up code.
`ctx`     | Object   | A *fixture context* object used to [share variables](#sharing-variables-between-fixture-hooks-and-test-code) between fixture hooks and test code.

**Example**

```js
fixture `My fixture`
    .page `http://example.com`
    .before( async ctx => {
        /* fixture initialization code */
    })
    .after( async ctx => {
        /* fixture finalization code */
    });
```

#### Sharing Variables Between Fixture Hooks and Test Code

Hook functions passed to `fixture.before` and `fixture.after` methods take a `ctx` parameter that contains *fixture context*.
You can add properties to this parameter to share the value or object with test code.

```js
fixture `Fixture1`
    .before(async ctx  => {
        ctx.someProp = 123;
    })
    .after(async ctx  => {
        console.log(ctx.someProp); // > 123
    });
```

To access fixture context from tests, use the `t.fixtureCtx` property.

```text
t.fixtureCtx
```

Test code can read from `t.fixtureCtx`, assign to its properties or add new ones, but it cannot overwrite the entire `t.fixtureCtx` object.

**Example**

```js
fixture `Fixture1`
    .before(async ctx  => {
        ctx.someProp = 123;
    })
    .after(async ctx  => {
        console.log(ctx.newProp); // > abc
    });

test('Test1', async t => {
    console.log(t.fixtureCtx.someProp); // > 123
});

test('Test2', async t => {
    t.fixtureCtx.newProp = 'abc';
});
```

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
