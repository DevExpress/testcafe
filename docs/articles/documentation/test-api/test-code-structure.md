---
layout: docs
title: Test Code Structure
permalink: /documentation/test-api/test-code-structure.html
checked: true
---
# Test Code Structure

This topic contains the following sections:

* [Fixtures](#fixtures)
* [Tests](#tests)
  * [Test Controller](#test-controller)
  * [Setting Test Speed](#setting-test-speed)
  * [Setting Page Load Timeout](#setting-page-load-timeout)
* [Specifying the Start Webpage](#specifying-the-start-webpage)
* [Specifying Testing Metadata](#specifying-testing-metadata)
  * [Using Metadata in Reports](#using-metadata-in-reports)
* [Initialization and Clean-Up](#initialization-and-clean-up)
  * [Test Hooks](#test-hooks)
    * [Sharing Variables Between Test Hooks and Test Code](#sharing-variables-between-test-hooks-and-test-code)
  * [Fixture Hooks](#fixture-hooks)
    * [Sharing Variables Between Fixture Hooks and Test Code](#sharing-variables-between-fixture-hooks-and-test-code)
* [Skipping Tests](#skipping-tests)
* [Inject Scripts into Tested Pages](#inject-scripts-into-tested-pages)
* [Disable Page Caching](#disable-page-caching)

> If you use [eslint](http://eslint.org/) in your project, use  the [TestCafe plugin](https://www.npmjs.com/package/eslint-plugin-testcafe)
to avoid the `'fixture' is not defined` and `'test' is not defined` errors.

## Fixtures

TestCafe tests must be organized into categories called *fixtures*.
A JavaScript, TypeScript or CoffeeScript file with TestCafe tests can contain one or more fixtures.

To declare a test fixture, use the `fixture` function.

```text
fixture( fixtureName )
fixture `fixtureName`
```

Parameter     | Type   | Description
------------- | ------ | ------------------------
`fixtureName` | String | The name of the fixture.

This function returns the `fixture` object that allows you to configure the fixture - specify the [start webpage](#specifying-the-start-webpage), [metadata](#specifying-testing-metadata) and [initialization and clean-up code](#initialization-and-clean-up) for tests included in the fixture.

> [Tests](#tests) that constitute a fixture go after this declaration.

## Tests

To introduce a test, call the `test` function and pass the test code inside it.

```text
test( testName, fn(t) )
```

Parameter  | Type     | Description
---------- | -------- | --------------------------------------------------------------------
`testName` | String   | The test name.
`fn`       | Function | An asynchronous function that contains the test code.
`t`        | Object   | The [test controller](#test-controller) used to access the test run API.

```js
fixture `MyFixture`;

test('Test1', async t => {
    /* Test 1 Code */
});

test('Test2', async t => {
    /* Test 2 Code */
});
```

You can arrange test code in any manner and reference any modules or libraries.

TestCafe tests are executed on the server side. You can use [test actions](actions/README.md) to manipulate the tested webpage.
To determine page elements' state or obtain any other data from the client side, use the [selectors](selecting-page-elements/selectors/README.md) and
[client functions](obtaining-data-from-the-client/README.md).

To check if the page state matches the expected one, use [assertions](assertions/README.md).

### Test Controller

A *test controller* object `t` exposes the test API's methods. That is why it is
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

The test controller also provides access to the internal context the test API requires to operate.
This is why [selectors](selecting-page-elements/selectors/README.md) and
[client functions](obtaining-data-from-the-client/README.md) need the test controller object when they are
called from Node.js callbacks.

#### Using Test Controller Outside of Test Code

There may be times when you need to call the test API from outside the test code. For instance, your [page model](../recipes/extract-reusable-test-code/use-page-model.md)
can contain methods that perform common operations used in different tests (like authentication).

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
Instead, you can import `t` to the page model file.

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

TestCafe implicitly resolves test context and provides the right test controller.

### Setting Test Speed

TestCafe allows you to specify the test execution speed.

Tests are run at the maximum speed by default. You can use the `t.setTestSpeed` method
to specify the speed.

```text
t.setTestSpeed( factor )
```

Parameter  | Type      | Description
---------- | --------- | -----------
`factor`   | Number    | Specifies the test speed. Must be a number between `1` (the fastest) and `0.01` (the slowest).

If the speed is also specified for an [individual action](actions/action-options.md#basic-action-options), the action's speed setting overrides the test speed.

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

The page load timeout defines the time passed after the `DOMContentLoaded` event within which the `window.load` event should be raised.

After the timeout passes or the `window.load` event is raised (whichever happens first), TestCafe starts the test.

To specify the page load timeout in test code, use the `t.setPageLoadTimeout` method.

```text
t.setPageLoadTimeout( duration )
```

Parameter  | Type      | Description
---------- | --------- | -----------
`duration` | Number    | Page load timeout (in milliseconds). `0` to skip waiting for the `window.load` event.

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

You can specify the web page where all tests in a fixture start using the `fixture.page` function.

```text
fixture.page( url )
fixture.page `url`
```

Similarly, you can specify a start page for individual tests
using the `test.page` function that overrides the `fixture.page`.

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

You can use the `file://` scheme or relative paths to test web pages in local directories.

```js
fixture `MyFixture`
    .page `file:///user/my-website/index.html`;
```

```js
fixture `MyFixture`
    .page `../my-project/index.html`;
```

## Specifying Testing Metadata

TestCafe allows you to specify additional information for tests in the form of *key-value metadata* and use it in reports.

To define metadata, use the `meta` method. You can call this method for a fixture and a test.

The `meta` method allows you to specify one or several metadata entries:

* Specifying one metadata entry.

    ```js
    fixture.meta('key1', 'value1')
    ```

    ```js
    test.meta('key2', 'value2')
    ```

    Parameter | Type   | Description
    --------- | ------ | -----------------
    `name`    | String | The name of the metadata entry
    `value`   | String | The value of the metadata entry

* Specifying a set of metadata entries.

    ```js
    fixture.meta({ key1: 'value1', key2: 'value2', key3: 'value3' })
    ```

    ```js
    test.meta({ key4: 'value1', key5: 'value2', key6: 'value3' })
    ```

    Parameter  | Type   | Description
    ---------- | ------ | -----------------
    `metadata` | Object | Key-value pairs

**Examples**

```js
fixture `My fixture`
    .meta('fixtureID', 'f-0001')
    .meta({ author: 'John', creationDate: '05/03/2018' });
```

```js
test
    .meta('testID', 't-0005')
    .meta({ severity: 'critical', testedAPIVersion: '1.0' })
    ('MyTest', async t => { /* ... */});
```

All metadata entries specified for a fixture are applied to tests included in this fixture.

If you specified the same entries in the `test.meta` and `fixture.meta` methods, the `test.meta` method call overrides values of these entries. The following example demonstrates a `test.meta` method call that overrides the **creationDate** entry:

```js
fixture `My fixture`
    .meta('creationDate', '05/03/2018')
    .page `http://www.example.com/`;

test
    .meta('creationDate', '05/04/2018'); // The value of the creationDate entry is '05/04/2018'
    ('MyTest', async t => { /* ... */});
```

### Using Metadata in Reports

You can include testing metadata to reports using a [custom reporter](../extending-testcafe/reporter-plugin/README.md). The reporter's [reportFixtureStart](../extending-testcafe/reporter-plugin/reporter-methods.md#reportfixturestart) and [reportTestDone](../extending-testcafe/reporter-plugin/reporter-methods.md#reporttestdone) methods can access the fixture and test metadata.

## Initialization and Clean-Up

TestCafe allows you to specify functions that are executed before a fixture or test is started and after it is finished.
These functions are called *hook functions* or *hooks*.

### Test Hooks

Test hooks are executed in each test run before a test is started and after it is finished. If a test runs in several browsers, test hooks are executed in each browser.

At the moment test hooks run, the tested webpage is already loaded, so that you can use [test actions](actions/README.md) and other test run API inside test hooks.

You can specify a hook for each test in a fixture using the `beforeEach` and `afterEach` methods in the [fixture declaration](#fixtures).

```text
fixture.beforeEach( fn(t) )
```

```text
fixture.afterEach( fn(t) )
```

You can also specify hooks for an individual test using the `test.before` and `test.after` methods.

```text
test.before( fn(t) )
```

```text
test.after( fn(t) )
```

> If `test.before` or `test.after` is specified, it overrides the corresponding
> `fixture.beforeEach` and `fixture.afterEach` hook, so that the latter are not executed.

The `test.before`, `test.after`,  `fixture.beforeEach` and `fixture.afterEach` methods accept the following parameters:

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

Instead of using a global variable, assign the object you want to share directly to `t.ctx` or create a property as in the following example:

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

If several tests or fixtures are marked with `only`, all the marked tests and fixtures are run.

**Examples**

```js
fixture.skip `Fixture1`; // All tests in this fixture are skipped

test('Fixture1Test1', () => {});
test('Fixture1Test2', () => {});

fixture `Fixture2`;

test('Fixture2Test1', () => {});
test.skip('Fixture2Test2', () => {}); // This test is skipped
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

// Only tests in Fixture1 and the Fixture2Test2 test are run
```

## Inject Scripts into Tested Pages

TestCafe allows you to [inject custom scripts](../using-testcafe/common-concepts/inject-scripts-into-tested-pages.md) into pages visited during the tests. You can add scripts that mock browser API or provide helper functions.

Use the `fixture.clientScripts` and `test.clientScripts` methods to add scripts to pages visited during a particular test or fixture.

```text
fixture.clientScripts( script[, script2[, ...[, scriptN]]] )
```

```text
test.clientScripts( script[, script2[, ...[, scriptN]]] )
```

Parameter | Type     | Description
--------- | -------- | ---------------------------------------------------------------------------
`script`, `script2`, `scriptN` | String &#124; Object &#124; Array | Scripts to inject into the tested pages. See [Provide Scripts to Inject](../using-testcafe/common-concepts/inject-scripts-into-tested-pages.md#provide-scripts-to-inject) to learn how to specify them.

> Relative paths resolve from the test file location.

You can use the [page](../using-testcafe/common-concepts/inject-scripts-into-tested-pages.md#provide-scripts-for-specific-pages) option to specify pages into which scripts should be injected. Otherwise, TestCafe injects scripts into all pages visited during the test or fixture.

> If you add client scripts to both the fixture and test, scripts added to the fixture run first.

**Examples**

```js
fixture `My fixture`
    .page `http://example.com`
    .clientScripts('assets/jquery.js');
```

```js
test
    ('My test', async t => { /* ... */ })
    .clientScripts({ module: 'async' });
```

```js
test
    ('My test', async t => { /* ... */ })
    .clientScripts({
        page: /\/user\/profile\//,
        content: 'Geolocation.prototype.getCurrentPosition = () => new Positon(0, 0);'
    });
```

To inject scripts into pages visited during all tests, use either of the following:

* the [--cs (--client-scripts)](../using-testcafe/command-line-interface.md#--cs-pathpath2---client-scripts-pathpath2) command line option
* the [runner.clientScripts](../using-testcafe/programming-interface/runner.md#clientscripts) method
* the [clientScripts](../using-testcafe/configuration-file.md#clientscripts) configuration file property

See [Inject Scripts into Tested Pages](../using-testcafe/common-concepts/inject-scripts-into-tested-pages.md) for more information.

## Disable Page Caching

When navigation to a cached page occurs in [role code](authentication/user-roles.md), local and session storage content is not preserved. See [Troubleshooting: Test Actions Fail After Authentication](authentication/user-roles.md#test-actions-fail-after-authentication) for more information.

You can disable page caching to keep items in these storages after navigation. Use the `fixture.disablePageCaching` and `test.disablePageCaching` methods to disable caching during a particular fixture or test.

```text
fixture.disablePageCaching
```

```text
test.disablePageCaching
```

**Examples**

```js
fixture
    .disablePageCaching `My fixture`
    .page `https://example.com`;
```

```js
test
    .disablePageCaching
    ('My test', async t => { /* ... */ });
```

To disable page caching during the entire test run, use either of the following options:

* the [--disable-page-caching](../using-testcafe/command-line-interface.md#--disable-page-caching) command line flag
* the `disablePageCaching` option in the [runner.run](../using-testcafe/programming-interface/runner.md#run) method
* the [disablePageCaching](../using-testcafe/configuration-file.md#disablepagecaching) configuration file option
