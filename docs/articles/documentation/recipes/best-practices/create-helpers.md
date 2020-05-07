---
layout: docs
title: Create Helpers
permalink: /documentation/recipes/best-practices/create-helpers.html
redirect_from:
  - /documentation/recipes/extract-reusable-test-code/create-helpers.html
  - /documentation/recipes/create-helpers.html
---
# Create Helpers

We recommend that you follow the [page model pattern](../../guides/concepts/page-model.md) to extract reusable test code. This pattern allows you to abstract out both page structure and test logic.

If you need to extract only the helper functions, however, you can export them from a separate script file.

[Full Example Code](https://github.com/DevExpress/testcafe-examples/tree/master/examples/extract-code-to-helpers)

The following example shows a `helper.js` file that exports the `enterName`, `typeComment`, and `submitForm` asynchronous functions:

```js
import { t } from 'testcafe';

export async function enterName(name) {
    await t.typeText('#developer-name', name);
};

export async function typeComment(text) {
    await t
        .click('#tried-test-cafe')
        .typeText('#comments', text);
};

export async function submitForm() {
    await t.click('#submit-button');
};
```

Note that this file imports `t` (the [test controller](../../reference/test-api/testcontroller/README.md)) from the `testcafe` module. You don't need to pass `t` to helper functions because TestCafe can resolve the current test context and provide the correct test controller instance.

In test code, import functions from `helper.js` and call them with the `await` keyword:

```js
import { Selector } from 'testcafe';
import { enterName, typeComment, submitForm } from './helper.js';

fixture `My Fixture`
    .page `https://devexpress.github.io/testcafe/example/`;

test('My Test', async t => {
    const name = 'John Heart';

    await enterName(name);
    await typeComment('Here is what I think...');
    await submitForm();
    await t.expect(Selector('#article-header').textContent).contains(name);
});
```
