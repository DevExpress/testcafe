---
layout: docs
title: TestController
permalink: /documentation/reference/test-api/testcontroller/
---
# TestController

A *test controller* object exposes the test API's methods. The test controller is passed to each function that can run server-side test code (like [test](../global/test.md), [beforeEach](../fixture/beforeeach.md) or [afterEach](../fixture/aftereach.md)).

Use the test controller to call [test actions](../../../guides/basic-guides/interact-with-the-page.md), handle [browser dialogs](../../../guides/basic-guides/interact-with-the-page.md#handle-native-dialogs), use the [wait function](../../../guides/basic-guides/interact-with-the-page.md#wait), or [execute assertions](../../../guides/basic-guides/assert.md).

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

The test runner also uses the test controller to access the internal context required for the test API to operate. When you call [selectors](../../../guides/basic-guides/select-page-elements.md) and [client functions](../../../guides/basic-guides/obtain-client-side-info.md) from Node.js callbacks, pass the test controller explicitly, because the API cannot retrieve it from the context.

## Implicit Test Controller Usage

In certain scenarios, you may need to call the test API from outside the test code. For instance, your [page model](../../../guides/concepts/page-model.md) can contain methods that perform common operations used in different tests (like authentication).

```js
import { Selector } from 'testcafe';

class Page {
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

export default new Page();
```

In this example, the page model's `login` method uses the test controller to perform authentication actions.

TestCafe can implicitly resolve the test context when you import the test controller, so you do not have to pass the test controller object explicitly.

```js
import { Selector, t } from 'testcafe';

class Page {
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

export default new Page();
```
