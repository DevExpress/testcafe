---
layout: docs
title: Organize Tests
permalink: /documentation/guides/basic-guides/organize-tests.html
redirect_from:
  - /documentation/test-api/test-code-structure.html
---
# Organize Tests

This topic describes how to organize test code, declare fixtures, tests, and hooks.

* [Fixtures](#fixtures)
* [Tests](#tests)
* [Specify the Start Webpage](#specify-the-start-webpage)
* [Specify Test Metadata](#specify-test-metadata)
  * [Use Metadata to Filter Tests](#use-metadata-to-filter-tests)
  * [Display Metadata in the Reports](#display-metadata-in-the-reports)
* [Initialization and Clean-Up](#initialization-and-clean-up)
  * [Test Hooks](#test-hooks)
    * [Share Variables Between Test Hooks and Test Code](#share-variables-between-test-hooks-and-test-code)
  * [Fixture Hooks](#fixture-hooks)
    * [Share Variables Between Fixture Hooks and Test Code](#share-variables-between-fixture-hooks-and-test-code)
* [Skip Tests](#skip-tests)

> If you use [eslint](http://eslint.org/) in your project, install the [TestCafe plugin](https://www.npmjs.com/package/eslint-plugin-testcafe) to avoid the `'fixture' is not defined` and `'test' is not defined` errors.

## Fixtures

TestCafe tests must be organized into categories called *fixtures*. A JavaScript, TypeScript or CoffeeScript file with TestCafe tests can contain one or more fixtures.

To declare a test fixture, use the [fixture](../../reference/test-api/global/fixture.md) function.

```js
fixture `Authentication tests`;
```

[Tests](#tests) that constitute a fixture go after this declaration.

## Tests

To create a test, call the [test](../../reference/test-api/global/test.md) function and pass a function with test code inside.

```js
fixture `MyFixture`;

test('Test1', async t => {
    /* Test 1 Code */
});

test('Test2', async t => {
    /* Test 2 Code */
});
```

The test code function accepts the [test controller](../../reference/test-api/testcontroller/README.md) object as a parameter. The test controller provides access to the TestCafe test API.

You can arrange test code in any manner and reference any modules or libraries.

TestCafe tests are executed server side. You can use [test actions](interact-with-the-page.md) to manipulate the tested webpage. To determine page element states or obtain other data from the client side, use the [selectors](select-page-elements.md) and [client functions](obtain-client-side-info.md).

To check if page elements have the expected parameters, use [assertions](assert.md).

## Specify the Start Webpage

You can specify the web page where all tests in a fixture begin with the [fixture.page](../../reference/test-api/fixture/page.md) function.

```js
fixture `MyFixture`
    .page `http://devexpress.github.io/testcafe/example`;

test('Test1', async t => {
    // Starts at http://devexpress.github.io/testcafe/example
});
```

Similarly, you can specify a start page for individual tests with the [test.page](../../reference/test-api/test/page.md) function that overrides the [fixture.page](../../reference/test-api/fixture/page.md).

```js
fixture `MyFixture`
    .page `http://devexpress.github.io/testcafe/example`;

test
    .page `http://devexpress.github.io/testcafe/blog/`
    ('My test', async t => {
        // Starts at http://devexpress.github.io/testcafe/blog/
    });
```

## Specify Test Metadata

TestCafe allows you to specify additional information for tests in the form of *key-value metadata*. You can display this information in the reports and use it to filter tests.

To define metadata, use the [fixture.meta](../../reference/test-api/fixture/meta.md) and [test.meta](../../reference/test-api/test/meta.md) methods.

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

### Use Metadata to Filter Tests

You can run tests or fixtures whose metadata contains specific values. Use the following options to filter tests by metadata:

* the [--test-meta](../../reference/command-line-interface.md#--test-meta-keyvaluekey2value2) and [--fixture-meta](../../reference/command-line-interface.md#--fixture-meta-keyvaluekey2value2) command line options
* the `testMeta` and `fixtureMeta` parameters in the [runner.filter](../../reference/testcafe-api/runner/filter.md) method
* the [filter.testMeta](../../reference/configuration-file.md#filtertestmeta) and [filter.fixtureMeta](../../reference/configuration-file.md#filterfixturemeta) configuration file properties

### Display Metadata in the Reports

You can include test's metadata to reports in [custom reporters](../extend-testcafe/reporter-plugin.md). The reporter's [reportFixtureStart](../../reference/plugin-api/reporter.md#reportfixturestart) and [reportTestDone](../../reference/plugin-api/reporter.md#reporttestdone) methods can access the fixture and test metadata.

## Initialization and Clean-Up

You can specify functions to be executed before a fixture or test starts and after it is completed. These functions are called *hooks*.

### Test Hooks

Test hooks run before a test starts and after it is completed. If a test runs in several browsers, test hooks are executed in each browser.

When test hooks run, the tested webpage is already loaded, and you can use [test actions](interact-with-the-page.md) and other test run API inside test hooks.

You can specify a hook for each test in a fixture with the [fixture.beforeEach](../../reference/test-api/fixture/beforeeach.md) and [fixture.afterEach](../../reference/test-api/fixture/aftereach.md) methods.

```js
fixture `My fixture`
    .page `http://example.com`
    .beforeEach( async t => {
        await t
            .useRole(admin)
            .click('#open-management-console');
    })
    .afterEach( async t => {
        await t.click('#delete-data');
    });
```

You can also specify hooks for an individual test with the [test.before](../../reference/test-api/test/before.md) and [test.after](../../reference/test-api/test/after.md) methods.

```js
test
    .before( async t => {
        await t
            .useRole(admin)
            .click('#open-management-console');
    })
    ('MyTest', async t => { /* ... */ })
    .after( async t => {
        await t.click('#delete-data');
    });
```

> If `test.before` or `test.after` is specified, it overrides the corresponding
> `fixture.beforeEach` and `fixture.afterEach` hooks, and the latter are not executed.

#### Share Variables Between Test Hooks and Test Code

You can share variables between test hook functions and test code in the *test context* object.

Use the [t.ctx](../../reference/test-api/testcontroller/ctx.md) property to access test context.

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

### Fixture Hooks

Fixture hooks run before the first test in a fixture starts and after the last test finishes.

Unlike [test hooks](#test-hooks), fixture hooks run between tests and do not have access to the tested page. Use them to perform server-side operations, like preparing the server that hosts the tested app.

To specify fixture hooks, use the [fixture.before](../../reference/test-api/fixture/before.md) and [fixture.after](../../reference/test-api/fixture/after.md) methods.

```js
import { utils } from './my-utils.js';

fixture `My fixture`
    .page `http://example.com`
    .before( async ctx => {
        utils.populateDb(ctx.dbName);
    })
    .after( async ctx => {
        utils.dropDb(ctx.dbName);
    });
```

#### Share Variables Between Fixture Hooks and Test Code

Hook functions passed to `fixture.before` and `fixture.after` methods accept the `ctx` parameter that contains *fixture context*. You can add properties to this parameter to share the value or object with test code.

```js
fixture `Fixture1`
    .before(async ctx  => {
        ctx.someProp = 123;
    })
    .after(async ctx  => {
        console.log(ctx.someProp); // > 123
    });
```

To access fixture context from tests, use the [t.fixtureCtx](../../reference/test-api/testcontroller/fixturectx.md) property.

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

## Skip Tests

TestCafe allows you to specify a test or a fixture to skip when tests run. Use the [fixture.skip](../../reference/test-api/fixture/skip.md) and [test.skip](../../reference/test-api/test/skip.md) methods for this.

```js
fixture.skip `Fixture 1`; // All tests in this fixture are skipped

test('Fixture 1 - Test 1', () => {});
test('Fixture 1 - Test 2', () => {});

fixture `Fixture 2`;

test('Fixture 2 - Test 1', () => {});
test.skip('Fixture 2 - Test 2', () => {}); // This test is skipped
test('Fixture 2 - Test 3', () => {});
```

You can also use the [fixture.only](../../reference/test-api/fixture/only.md) and [test.only](../../reference/test-api/test/only.md) methods to specify that only a particular test or fixture should run while all others should be skipped.

```js
fixture.only `Fixture 1`;
test('Fixture 1 - Test 1', () => {});
test('Fixture 1 - Test 2', () => {});

fixture `Fixture 2`;

test('Fixture 2 - Test 1', () => {});
test.only('Fixture 2 - Test 2', () => {});
test('Fixture 2 - Test 3', () => {});

// Only tests in 'Fixture 1' and the 'Fixture 2 - Test 2' test are run
```

If several tests or fixtures are marked with `only`, all the marked tests and fixtures are run.
