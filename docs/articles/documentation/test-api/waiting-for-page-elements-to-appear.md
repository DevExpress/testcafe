---
layout: docs
title: Waiting for Page Elements to Appear
permalink: /documentation/test-api/waiting-for-page-elements-to-appear.html
---
# Waiting for Page Elements to Appear

TestCafe has a built-in automatic waiting mechanism, so that it does not need dedicated API to wait for page elements to appear.

This topic describes how the automatic waiting mechanism works with [test actions](actions/README.md),
[assertions](assertions/README.md) and [selectors](selecting-page-elements/selectors/README.md).

## Waiting for Action Target Elements

TestCafe automatically waits for the target element to become visible when an action is executed.

```js
import { Selector } from 'testcafe';

fixture `My fixture`
    .page `https://devexpress.github.io/testcafe/example`;

const nameInput    = Selector('#developer-name');
const submitButton = Selector('#submit-button');

test('My test', async t => {
    await t
        .typeText(nameInput, 'Peter Parker') // Waits for `#developer-name`
        .click(submitButton);                // Waits for '#submit-button'
});
```

TestCafe tries to evaluate the specified selector multiple times within the [timeout](selecting-page-elements/selectors/using-selectors.md#selector-timeout).
If the element does not appear, the test will fail.

The exceptions are [t.setFilesToUpload](actions/upload.md#populate-file-upload-input) and [t.clearUpload](actions/upload.md#clear-file-upload-input) actions that do not require that the target element is visible.

## Waiting for Elements When Evaluating Selectors

When evaluating a selector, TestCafe automatically waits for the element to appear in the DOM.

```js
import { Selector } from 'testcafe';

fixture `My fixture`
    .page `https://devexpress.github.io/testcafe/example`;

const nameInput = Selector('#developer-name');

test('My test', async t => {

    // Waits for '#developer-name' to appear in the DOM.
    const nameInputElement = await nameInput();
});
```

TestCafe keeps trying to evaluate the selector until the element appears in the DOM or the [timeout](selecting-page-elements/selectors/using-selectors.md#selector-timeout) passes.

You can additionally require that TestCafe should wait for an element to become visible.
Use the [visibilityCheck](selecting-page-elements/selectors/selector-options.md#optionsvisibilitycheck) selector option for this.

```js
import { Selector } from 'testcafe';

fixture `My fixture`
    .page `https://devexpress.github.io/testcafe/example`;

const nameInput = Selector('#developer-name');

test('My test', async t => {

    // Waits for '#developer-name' to appear in the DOM and become visible.
    const nameInputElement = await nameInput.with({ visibilityCheck: true })();
});
```

## Waiting for Assertions to Pass

TestCafe assertions feature the [Smart Assertion Query Mechanism](assertions/README.md#smart-assertion-query-mechanism).
This mechanism is activated when you pass a [selector property](selecting-page-elements/selectors/using-selectors.md#obtain-element-state)
or a [client function](obtaining-data-from-the-client/README.md) as an actual value. In this instance, TestCafe keeps recalculating the actual
value until it matches the expected value or the [assertion timeout](assertions/README.md#optionstimeout) passes.

Note that the Smart Assertion Query Mechanism does not wait for page elements to appear.
If you need to wait for an element before executing an assertion,
add another assertion that checks the selector's [count](selecting-page-elements/selectors/using-selectors.md#check-if-an-element-exists)
or [exists](selecting-page-elements/selectors/using-selectors.md#check-if-an-element-exists) property.

```js
import { Selector } from 'testcafe';

fixture `My fixture`
    .page `https://devexpress.github.io/testcafe/example`;

const nameInput = Selector('#developer-name');
const populate  = Selector('#populate');

test('My test', async t => {
    await t
        .setNativeDialogHandler(() => true)
        .click(populate)

        // Waits for the '#developer-name'
        // element to appear in DOM.
        .expect(nameInput.exists).ok()

        // Keeps trying to obtain nameInput.value
        // until it equals 'Peter Parker'
        // or the timeout passes.
        .expect(nameInput.value).eql('Peter Parker');
});
```