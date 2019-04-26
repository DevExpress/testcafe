---
layout: docs
title: Create Helper Files
permalink: /documentation/recipes/extract-reusable-test-code/create-helper-files.html
---
# Create Helper Files

We recommend that you follow the [page model](use-page-model.md) pattern to extract reusable test code. This pattern allows you to abstract out both page structure and test logic.

* [Use Page Model](use-page-model.md)

However, if you need to extract only the helper functions, you can export them from a separate script file.

The following example shows a `helper.js` file that exports the `enterUsername` and `postComment` asynchronous functions:

```js
import { t } from 'testcafe';

export async function enterUsername(name) {
    await t
        .typeText('#name-input', name)
        .click('#i-agree-check-box')
        .click('#submit-button');
};

export async function postComment(text) {
    await t
        .typeText('#comment-input', text)
        .click('#post-button');
};
```

Note that this file imports `t` (the [test controller](../test-api/test-code-structure.md#test-controller)) from the `testcafe` module. You don't need to pass `t` to helper functions because TestCafe can resolve the current test context and provide the correct test controller instance.

In test code, import functions from `helper.js` and call them with the `await` keyword:

```js
import { Selector } from 'testcafe';
import { enterUsername, postComment } from './helper.js';

fixture `My Fixture`
    .page `https://www.example.com`;

test('My Test', async t => {
    const commentText = 'Here is what I think...';

    await enterUsername('John Heart');
    await t.expect(Selector('#user-avatar').exists).ok();
    await postComment(commentText);
    await t.expect(Selector('#comment').textContent).eql(commentText);
});
```