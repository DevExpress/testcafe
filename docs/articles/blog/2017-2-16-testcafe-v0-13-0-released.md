---
layout: post
title: TestCafe v0.13.0 Released
permalink: /blog/:title.html
---
# TestCafe v0.13.0 Released

IDE plugins, fixture hooks, speed setting for actions, a couple of API enhancements and lots of bug fixes.

<!--more-->

## IDE Plugins

With this release, we have prepared test runner plugins for
[VSCode](https://github.com/romanresh/vscode-testcafe) and [SublimeText](https://github.com/churkin/testcafe-sublimetext).
These plugins allow you to

* Run a particular test, fixture, all tests in a file or directory via the context menu or built-in commands,
* Automatically detect browsers installed on the local machine,
* Repeat last test run,
* Debug tests,
* View test results in the `Debug Console` panel.

## Enhancements

### ⚙ Fixture hooks ([#903](https://github.com/DevExpress/testcafe/issues/903))

You can now specify fixture hooks that will be executed before the first test in a fixture is started and after the last test is finished.

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

Unlike test hooks, fixture hooks are executed between test runs and do not have access to the tested page.
Use them to perform server-side operations like preparing the server that hosts the tested app.

#### Sharing variables between fixture hooks and test code

Use the `ctx` parameter passed to `fixture.before` and `fixture.after` methods (*fixture context*) to share values and objects with test code.
You can assign to `ctx` parameter's properties or add new properties.

In test code, use the `t.fixtureCtx` property to access the fixture context.

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

### ⚙ Speed option for test actions ([#865](https://github.com/DevExpress/testcafe/issues/865))

You can now specify speed for individual test actions using the `speed` option.

```js
import { Selector } from 'testcafe';

const nameInput = Selector('#developer-name');

fixture `My Fixture`
    .page `http://devexpress.github.io/testcafe/example/`

test('My Test', async t => {
    await t
        .typeText(nameInput, 'Peter')
        .typeText(nameInput, ' Parker', { speed: 0.1 });
});
```

If speed is also specified for the whole test, the action speed setting overrides test speed.

### ⚙ Setting test speed from test code ([#865](https://github.com/DevExpress/testcafe/issues/865))

You can now specify test speed from code using the `t.setTestSpeed` method.

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

### ⚙ Using test controller outside of test code ([#1166](https://github.com/DevExpress/testcafe/issues/1166))

You may sometimes need to call test API from outside of test code. For instance, your [page model](https://devexpress.github.io/testcafe/documentation/recipes/using-page-model.html)
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

### ⚙ Inserting text with one keystroke with t.typeText action (by [@ericyd](https://github.com/ericyd)) ([#1230](https://github.com/DevExpress/testcafe/issues/1230))

The new `paste` option allows you to insert a portion of text with one keystroke, similar to the paste operation.

```js
import { Selector } from 'testcafe';

fixture `My fixture`
    .page `http://devexpress.github.io/testcafe/example/`;

const nameInput = Selector('#developer-name');

test(`My test`, async t => {
    await t
        .typeText(nameInput, 'Peter')
        .typeText(nameInput, ' Parker', { paste: true });
});
```

### ⚙ prevSibling and nextSibling selector's DOM search methods ([#1218](https://github.com/DevExpress/testcafe/issues/1218))

The new `prevSibling` and `nextSibling` methods allow you to search among sibling elements that reside before and after the selector's matching elements in the DOM tree.

```js
Selector('li .active').prevSibling(2);
Selector('li').nextSibling('.checked');
```

### ⚙ Deprecated functionality removed ([#1167](https://github.com/DevExpress/testcafe/issues/1167))

The following deprecated members have been removed from the API.

* `t.select` method - use `Selector` instead:

```js
const id = await t.select('.someClass').id;

// can be replaced with

const id = await Selector('.someClass').id;
```

* `selectorOptions.index` - use [selector.nth()](http://devexpress.github.io/testcafe/documentation/test-api/selecting-page-elements/selectors.html#nth) instead.
* `selectorOptions.text` - use [selector.withText()](http://devexpress.github.io/testcafe/documentation/test-api/selecting-page-elements/selectors.html#withtext) instead.
* `selectorOptions.dependencies` - use [filtering](https://devexpress.github.io/testcafe/documentation/test-api/selecting-page-elements/selectors.html#filter-dom-nodes) and [hierarchical](https://devexpress.github.io/testcafe/documentation/test-api/selecting-page-elements/selectors.html#search-for-elements-in-the-dom-hierarchy) methods to build combined selectors instead.

## Bug Fixes

* Fixed a bug where tests failed with a script error ([#1188](https://github.com/DevExpress/testcafe/issues/1188))
* Text can now be typed to an input field with type "email" in Firefox ([#1187](https://github.com/DevExpress/testcafe/issues/1187))
* `npm install` no longer displays warnings ([#769](https://github.com/DevExpress/testcafe/issues/769))
* Dev Tools can now be opened with a keyboard shortcut or right click on macOS ([#1193](https://github.com/DevExpress/testcafe/issues/1193))
* A warning no longer appears when using ClientFunction with dependencies ([#1168](https://github.com/DevExpress/testcafe/issues/1168))
* Tests can now run against React Storybook ([#1147](https://github.com/DevExpress/testcafe/issues/1147))
* Script error is no longer thrown in iOS webviews (Firefox, Chrome of iOS) ([#1189](https://github.com/DevExpress/testcafe/issues/1189))
* XhrSandbox.createNativeXHR now works correctly ([testcafe-hammerhead/#1042](https://github.com/DevExpress/testcafe-hammerhead/issues/1042))
* Window.prototype is no longer used for NativeMethods initialization ([testcafe-hammerhead/#1040](https://github.com/DevExpress/testcafe-hammerhead/issues/1040))
* Functions from the 'vm' module are now overridden on the client ([testcafe-hammerhead/#1029](https://github.com/DevExpress/testcafe-hammerhead/issues/1029))
* Input type is now changed while setting the selection range in Firefox ([testcafe-hammerhead/#1025](https://github.com/DevExpress/testcafe-hammerhead/issues/1025))
* An iframe with the `about:blank` src can now send `postMessage` ([testcafe-hammerhead/#1026](https://github.com/DevExpress/testcafe-hammerhead/issues/1026))
* The `formaction` attribute is now overridden correctly after it is appended in DOM ([testcafe-hammerhead/#1021](https://github.com/DevExpress/testcafe-hammerhead/issues/1021))
* Fixed a bug where the Authorization Header was wrongly removed ([testcafe-hammerhead/#1016](https://github.com/DevExpress/testcafe-hammerhead/issues/1016))
* The `file://` protocol is now supported ([testcafe-hammerhead/#908](https://github.com/DevExpress/testcafe-hammerhead/issues/908))