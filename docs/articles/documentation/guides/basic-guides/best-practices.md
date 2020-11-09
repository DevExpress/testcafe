---
layout: docs
title: Best Practices
permalink: /documentation/guides/basic-guides/best-practices.html
---
# Best Practices

This article describes the recommended ways to test with TestCafe. The main topics are as follows:

* [E2E Test Scope](#e2e-test-scope)
* [Smart Assertions](#smart-assertions)
* [Use of Page Objects](#use-of-page-objects)
* [Use of Roles for Login](#use-of-roles-for-login)
* [File Structure](#file-structure)
* [Setup and Teardown](#setup-and-teardown)
* [Selector Strategy](#selector-strategy)

## E2E Test Scope

During the functional (also known as 'end-to-end') testing, the application is tested from beginning to end. This is in contrast to unit or integration tests, which focus on a specific part (or integration between parts) of the application.

TestCafe is a tool built for functional testing. Do not use it to perform non-functional testing (like performance or load testing). Such tests would not yield any conclusive results.

In your end-to-end tests, try to replicate real user actions. Don't test exceptions - these are better tested with unit and integration tests. Test the general business logic of your application and refrain from rare scenarios and edge cases.

Write fewer E2E tests. End-to-end tests are slow by nature, so the number of tests should be drastically lower than that of unit or integration tests.

## Smart Assertions

In end-to-end web testing, unpredictable factors (like network lag, processor speed, or memory bottlenecks in containers) can interfere with the assertions and produce inconsistent test results. Such tests are inconclusive (sometimes called 'flaky').

TestCafe includes a [Smart Assertion Query Mechanism](../../guides/basic-guides/assert.md#smart-assertion-query-mechanism). This mechanism introduces wait time for all the assertions; if an assertion fails, it retries multiple times within a timeout. That reduces random impact and stabilizes the tests without performance trade-offs.

The following example demonstrates a common mistake:

```js
import { Selector } from 'testcafe';

fixture `My fixture`
    .page `http://devexpress.github.io/testcafe/example/`;

test('Assertion with Selector', async t => {
    const developerNameInput = Selector('#developer-name');

    await t.typeText(developerNameInput, 'Peter');

    //the selector prefixed with the "await" operator doesn't update and produces unstable test results. Avoid it.
    const developerName = await Selector('#developer-name').value;

    await t
            .expect(developerName).eql('Peter')
            .typeText(developerNameInput, 'Jack')
            .expect(developerName).eql('Jack'); // fails
});
```

In this snippet, the `developerName` is initialized with the value of a Selector, but because of the `await` keyword, the value is calculated once and doesn't update. This disables the smart assertions query mechanism and leads to inconclusive results.

To enable the mechanism, omit the `await` keyword:

```js
import { Selector } from 'testcafe';

fixture `My fixture`
    .page `http://devexpress.github.io/testcafe/example/`;

test('Assertion with Selector', async t => {
    const developerNameInput = Selector('#developer-name');

    await t.typeText(developerNameInput, 'Peter');

    const developerName = Selector('#developer-name').value;

    await t
            .expect(developerName).eql('Peter')
            .typeText(developerNameInput, 'Jack')
            .expect(developerName).eql('Jack'); // passes
});
```

The `developerName` is now initialized with a re-executable Selector API promise. When a test controller receives this promise, it enables the smart assertion query mechanism so TestCafe can wait for the value to update.

> The smart assertion query mechanism works with Client Functions and promises created by TestCafe Selector and RequestLogger APIs. Use the `await` keyword with user-created promises and promises returned from third-party libraries.

This rule applies to ClientFunctions as well.

The test below yields inconsistent results:

```js
import { Selector, ClientFunction } from 'testcafe';

fixture `My fixture`
    .page `http://devexpress.github.io/testcafe/example/`;

test('Assertion with ClientFunction', async t => {
    const interfaceSelect = Selector('#preferred-interface');
    const interfaceOption = interfaceSelect.find('option');

    const getValue        = ClientFunction(() => document.getElementById('preferred-interface').value);
    const value           = await getValue();

    await t
        .click(interfaceSelect)
        .click(interfaceOption.withText('JavaScript API'))
        .expect(value).eql('JavaScript API');
        //fails
});
```

In this example, the client function obtains the value of a drop-down element. This value is then passed to the `t.expect` method. Since `getValue()` is called with await, the return value gets resolved instantly and never updates. The smart assertion query mechanism doesn't apply and the test fails.

To solve the issue, pass the client function without the `await` keyword:

```js
import { Selector, ClientFunction } from 'testcafe';

fixture `My fixture`
    .page `http://devexpress.github.io/testcafe/example/`;

test('Assertion with ClientFunction', async t => {
    const getValue = ClientFunction(() => document.getElementById('preferred-interface').value)

    const interfaceSelect = Selector('#preferred-interface');
    const interfaceOption = interfaceSelect.find('option');
    const value           =  getValue();

    await t
        .click(interfaceSelect)
        .click(interfaceOption.withText('JavaScript API'))
        .expect(value).eql('JavaScript API')
});
```

In this case, TestCafe applies the smart query mechanism and retries the assertion multiple times. This test responds to the changes that occur on the page and is more conclusive.

## Use of Page Objects

Use the Page Model in your tests. Consider this simple page object of our [Example Page](https://devexpress.github.io/testcafe/example/).

```js
import {t, Selector } from 'testcafe';

class Page {
    constructor () {
        this.nameInput               = Selector('input').withAttribute('data-testid', 'name-input');
        this.importantFeaturesLabels = Selector('legend').withExactText('Which features are important to you:').parent().child('p').child('label');
        this.submitButton            = Selector('button').withAttribute('data-testid', 'submit-button');
    }

    async selectFeature(number) {
        await t.click(this.importantFeaturesLabels.nth(number));
    }

    async clickSubmit() {
        await t.click(this.submitButton);
    }

    async typeName(name) {
        await t.typeText(this.nameInput, name);
    }
}

export default new Page();
```

The page object holds references to the desired elements on the page. Common operations are defined as an object's method.

This useful abstraction improves the flexibility of your tests - if the UI changes, change one file to update all references. A test with this model can look like this:

```js
import page from './page-model'

fixture `Use a Page Model`
    .page `https://devexpress.github.io/testcafe/example`;


test('Use a Page Model', async () => {

    await page.selectFeature(2);
    await page.typeName('Peter');
    await page.clickSubmit();

});
```

The page model object handles the identification of items and common operations. Tests are then more readable and less brittle because there is no duplicate code. Notice how this test doesn't require a test controller (`t`) since the page object handles all actions.

The [Page Model](../../guides/concepts/page-model.md) topic describes page object use in greater detail.

A code example is available in the [testcafe-examples](https://github.com/DevExpress/testcafe-examples/tree/master/examples/use-page-model) repository.

## Use of Roles for Login

Handle authentication during your tests with [User Roles](../../guides/advanced-guides/authentication.md#user-roles). Roles allow you to wrap authentication logic and credentials in a reusable object.

Define roles in a separate file with the [Role](../../reference/test-api/role/constructor.md) constructor and include them in your tests with the [t.useRole](../../reference/test-api/testcontroller/userole.md) method. The following example uses two user roles.

`/tests/roles/roles.js:`

```js
import { Role } from 'testcafe';

const regularUser = Role('http://example.com/login', async t => {
    await t
        .typeText('#login', 'TestUser')
        .typeText('#password', 'testpass')
        .click('#sign-in');
});

const admin = Role('http://example.com/login', async t => {
    await t
        .typeText('#login', 'Admin')
        .typeText('#password', 'adminpass')
        .click('#sign-in');
});

export { regularUser, admin };
```

`/tests/test_group1.js/test1.js:`

```js
import { regularUser, admin } from '../../roles/roles.js';

fixture `My Fixture`
    .page('../../my-page.html');

test('Regular user test', async t => {
    await t
        .useRole(regularUser);
});

test('Admin test', async t => {
    await t
        .useRole(admin);
});
```

See the [Authentication](../../guides/advanced-guides/authentication.md) article for more in-depth information.

## File Structure

Follow these guidelines to keep your test structure manageable and "clean":

* Use a page model to store Selectors and compound actions that are often used across your app. For instance, a page model function can contain all steps that are necessary to perform an action.

* Put all the page model files into one directory. If your application is divided logically into components or subsystems, split up the associated page model objects into separate files.

> You can find a page model example in the [testcafe-examples](https://github.com/DevExpress/testcafe-examples/tree/master/examples/use-page-model) repository.

* Keep all [Roles](#use-of-roles-for-login) in a separate file. This enables TestCafe to detect when the same Role is reused and further optimize the process.

* Create a `testcaferc.json` file in the root directory of the project. It enables you to fine-tune your tests, which can be useful in CI/CD systems. For more information, read the [Configuration File](../../reference/configuration-file.md) article.

* Define one `fixture` in every test file. While it's technically possible to define multiple, it may lead to confusion as your suite grows.

* A `fixture` should aggregate related tests. For example, place all authentication-related tests into one fixture.

* TestCafe tests are purely functional. As such, they should not depend on the implementation details and it is best to isolate them from production code. Keep your test files in a separate directory. You can name this directory appropriately (for instance, `tests`).

* In your test folder, create subfolders for tests that cover different subsystems of your application.

* Don't write long tests. Shorter test scenarios are easier to debug and can run concurrently.

* Any reused data (for example, large sets of reference values or form inputs) is better stored in a dedicated directory. Consider a descriptive folder name (for instance, `data`).

With all the suggestions applied, your project's file structure might look like this:

```sh
.
├── .testcaferc.json
└── tests
    ├── |- test_group1/
    │   └── |-test1.js
    │       |-test2.js
    ├── |- test_group2/
    │   └── |-test1.js
    │       |-test2.js
    ├── |- page_model/
    │   └── |- page1.js
    │       |- page2.js
    ├── |- helpers/
    │   └── |- helper1.js
    │       |- helper2.js
    ├── |- roles/
    │   └── |- roles.js
    └── |-data
```

## Setup and Teardown

State management is an integral and important part of web testing. When your tests run, there are inevitably leftovers - database or local storage records, cache, or cookies. This data requires deletion during teardown. Extra steps your app requires to run (like adding records to the database) are performed during setup.

Consider a test that downloads a file and saves it to a folder. Since the file system persists between tests, this file requires deletion when the test completes. This is better done with an `afterEach` hook:

```js
fixture `My fixture`
    .page `http://example.com`
    .afterEach( async t => {
        await cleanDir();
    });

test('My test', async t => {
    //test actions
});
```

While good for cleanup, `after` and `afterEach` hooks create mutual dependence between your tests when used to set up for the next test. The success rate of a test is then influenced by the preceding test, which is not desirable. Such tests need to run in a specific order and can't run in parallel.

Use `before` or `beforeEach` to fullfill your test's prerequisites (for example, to create a file necessary for a successful test run):

```js
fixture `Another fixture`
    .page `http://example.com`
    .beforeEach( async t => {
        await setupFileSystem();
    });

test('Another test', async t => {
    //test actions
});
```

If the `before`/`beforeEach` setup is unsuccessful, the corresponding test does not run, which saves you time. If `after`/`afterEach` setup yields an error, the following test runs and probably fails due to the unsuccessful setup.

To fulfill your test's prerequisites, use the `before` and `beforeEach` hooks. Clean the environment up with the `after` and `afterEach` hooks.

Use the `test.before` and `test.after` hooks to set a state that an individual test requires. Use `fixture.beforeEach` and `fixture.afterEach` to set a common state that all the tests in the suite require.

## Selector Strategy

The [TestCafe Studio blog](https://community.devexpress.com/blogs/testcafe/archive/2020/06/10/testcafe-studio-v1-3-0-a-new-way-to-work-with-selectors.aspx) explains the best ways to work with Selectors.

In general, follow these guidelines when you write the Selectors for your tests.

* Selectors shouldn’t be too specific. Otherwise, you might have to rewrite them after each page modification. For instance, `Selector(‘body’).find(‘div’).nth(5).find(‘p’).nth(3)` must be revised each time the number of elements on the page changes.

* Selectors shouldn't be too generic. Otherwise, they may return different elements after each markup change. For example, `Selector(‘div > button’)` can match multiple elements simultaneously.

* Selectors shouldn’t rely on element parameters that might change. For instance, `Selector('[style*="background-color: red"]')` uses a CSS style that changes often.

* Selectors should remain readable. Selectors should be easy to understand (by you or another developer) for as long as the test is maintained. For instance, it may be difficult to understand which element corresponds to the following selector: `Selector(‘div’).find(‘pre’).nextSibling(-1)`. In contrast, `Selector(‘#topContainer’).find(‘.child’).withText(‘Add item’)` is much easier to read.

* Selectors should reflect the user’s point of view. Since TestCafe supports end-to-end testing, it’s a good idea to build selectors that identify elements as an end-user would. For instance, `Selector(‘form’).find(‘[name=”btn-foo-123”]’)` might be stable, but it is written from the programmer’s perspective rather than from the user’s point of view.

* Use custom attributes (like `data-testid`) whose sole purpose is to identify items with TestCafe. These attributes are unlikely to change during development, so you don't need to rewrite your Selectors as frequently.

Group the Selectors in a [page model](#use-of-page-objects). It increases the resilience of your tests and helps remove redundant code.

Use the Selectors extension plugins for pages built with JavaScript frameworks. These extensions allow you to create Selectors that are more native to every framework.
Such plugins are available for the following popular front-end frameworks: [Angular](https://github.com/DevExpress/testcafe-angular-selectors), [React](https://github.com/DevExpress/testcafe-react-selectors), and [Vue](https://github.com/DevExpress/testcafe-vue-selectors).
