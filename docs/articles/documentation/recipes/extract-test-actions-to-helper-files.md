---
layout: docs
title: Extract Test Actions to Helper Files
permalink: /documentation/recipes/extract-test-actions-to-helper-files.html
---
# Extract Test Actions to Helper Files

It is a good practice to extract reusable pieces of test code to separate files. We recommend that you use a [page model](use-page-model.md) for this. It allows you to abstract both page structure and common test patterns.

* [Use Page Model](use-page-model.md)

However, if you need to extract only the helper functions, you can create script files that export them.

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

Note that this file imports `t` (the [test controller](../test-api/test-code-structure.md#test-controller)) from the `testcafe` module. You don't need to pass `t` to the helper functions. TestCafe can resolve the current test context and provide the correct test controller instance.

In test code, import functions from `helper.js` and call them with the `await` keyword.

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