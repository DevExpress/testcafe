---
layout: docs
title: Built-In Wait Mechanisms 
permalink: /documentation/guides/concepts/built-in-wait-mechanisms.html
redirect_from:
  - /documentation/test-api/built-in-waiting-mechanisms.html
  - /documentation/test-api/waiting-for-page-elements-to-appear.html
---
# Built-In Wait Mechanisms

TestCafe has a built-in automatic waiting mechanism and does not require dedicated API to wait for redirects or page elements to appear.

This topic describes how these mechanisms work when TestCafe performs [test actions](../basic-guides/interact-with-the-page.md), evaluates [assertions](../basic-guides/assert.md) and [selectors](../basic-guides/select-page-elements.md), sends requests, and navigates the browser.

* [Wait Mechanism for Actions](#wait-mechanism-for-actions)
* [Wait Mechanism for Selectors](#wait-mechanism-for-selectors)
* [Wait Mechanism for Assertions](#wait-mechanism-for-assertions)
* [Wait Mechanism for XHR and Fetch Requests](#wait-mechanism-for-xhr-and-fetch-requests)
* [Wait Mechanism for Redirects](#wait-mechanism-for-redirects)

## Wait Mechanism for Actions

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

TestCafe tries to evaluate the specified selector multiple times within the [timeout](../basic-guides/select-page-elements.md#selector-timeout).
If the element does not appear, the test will fail.

The [t.setFilesToUpload](../../reference/test-api/testcontroller/setfilestoupload.md) and [t.clearUpload](../../reference/test-api/testcontroller/clearupload.md) actions are exceptions because they do not require a visible target element.

## Wait Mechanism for Selectors

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

TestCafe keeps trying to evaluate the selector until the element appears in the DOM or the [timeout](../basic-guides/select-page-elements.md#selector-timeout) passes.

You can additionally require that TestCafe should wait for an element to become visible.
Use the [visibilityCheck](../../reference/test-api/selector/constructor.md#optionsvisibilitycheck) selector option for this.

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

## Wait Mechanism for Assertions

TestCafe assertions use the [Smart Assertion Query Mechanism](../basic-guides/assert.md#smart-assertion-query-mechanism) that is activated when you pass a [selector property](../basic-guides/select-page-elements.md#obtain-element-state)
or a [client function](../basic-guides/obtain-client-side-info.md) as an actual value. In this instance, TestCafe keeps recalculating the actual
value until it matches the expected value or the [assertion timeout](../basic-guides/assert.md#optionstimeout) passes.

Note that the Smart Assertion Query Mechanism does not wait for page elements to appear.
If you need to wait for an element before executing an assertion,
add another assertion that checks the selector's [count](../../reference/test-api/selector/count.md)
or [exists](../../reference/test-api/selector/exists.md) property.

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

## Wait Mechanism for XHR and Fetch Requests

TestCafe waits **3** seconds for XHR and fetch requests to complete before it executes a test action. The test continues after responses are received or the timeout is exceeded.

If you expect a request to take more time, use a [selector](../../reference/test-api/selector/constructor.md#optionstimeout) or [assertion](../basic-guides/assert.md#optionstimeout) with a custom timeout to wait until the UI reflects the request completion.

```js
// The page should print 'No Data' when the fetch request is completed.
const emptyLabel = Selector('p').withText('No Data').with({ visibilityCheck: true });

await t.click('#fetch-data');

// Wait with an assertion.
await t.expect(emptyLabel.exists).ok('', { timeout: 10000 });

// Wait with a selector.
const labelSnapshot = await emptyLabel.with({ timeout: 10000 });
```

## Wait Mechanism for Redirects

When an action triggers a redirect, TestCafe automatically waits for the server to respond.
The test continues if the server does not respond within **15** seconds.
