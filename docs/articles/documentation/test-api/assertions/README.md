---
layout: docs
title: Assertions
permalink: /documentation/test-api/assertions/
checked: false
---
# Assertions

You can use *assertions* to check if the tested webpage's state matches your expectations.

TestCafe provides a comprehensive set of assertions that are based on the Behavior Driven Development style (BDD-style).
See [Assertion API](assertion-api.md).

This topic consists of the following sections.

* [Assertion Structure](#assertion-structure)
* [Smart Assertion Query Mechanism](#smart-assertion-query-mechanism)
* [Assertion options](#assertion-options)
  * [options.timeout](#optionstimeout)

## Assertion Structure

TestCafe assertions start with the `expect` method the [test controller](../test-code-structure.html#test-controller) exposes.
This method accepts the actual value. You can pass a value, a [Selector's DOM node state property](../selecting-page-elements/selectors/using-selectors.md#define-assertion-actual-value)
or a [client function](../obtaining-data-from-the-client/README.md) promise.
TestCafe automatically waits for node state properties to obtain a value and for client functions to execute.
See [Smart Assertion Query Mechanism](#smart-assertion-query-mechanism) for details.

Next is an [assertion method](assertion-api.md). Assertion methods accept an expected value
and, optionally, other arguments.

For instance, the deep equality assertion has the following structure.

```text
await t.expect( actual ).eql( expected, message, options );
```

The sample below demonstrates how to use assertions:

```js
import { Selector } from 'testcafe';


fixture `Example page`
   .page `http://devexpress.github.io/testcafe/example/`;


test('Check property of element', async t => {
   const developerNameInput = Selector('#developer-name');

   await t
       .expect(developerNameInput.value).eql('', 'input is empty')
       .typeText(developerNameInput, 'Peter Parker')
       .expect(developerNameInput.value).contains('Peter', 'input contains text "Peter"');
});
```

## Smart Assertion Query Mechanism

You can perform the required assertions immediately after test action is executed in synchronous functional testing.

![Synchronous Functional Testing](../../../images/assertions/synchronous-testing.png)

Functional tests are asynchronous on the web. This means that we cannot get the expected changes immediately after an end-user's actions.
+For example, it can take time for the tested web page to send a request to the server for the required data, or an end-user's action launches an animation after which the web page reaches its final state.
+All these intervals cannot be pre-calculated because they depend on various factors: computer performance,
 network connection speed, etc. In this case, if we perform assertions immediately after the test action finished,we can get an indefinite result.

![Asynchronous Functional Testing](../../../images/assertions/asynchronous-testing.png)

An additional timeout is usually added when performing asynchronous functional tests.

![Asynchronous Functional Testing with Extra Waiting](../../../images/assertions/extra-waiting.png)

To stabilize such tests, you need to add a timeout that enables the required changes to be successfully applied.
Note that adding such timeouts can increase the test's running time.

If the TestCafe assertion receives a [Selector's DOM node state property](../selecting-page-elements/selectors/using-selectors.md#define-assertion-actual-value)
or a [client function](../obtaining-data-from-the-client/README.md) promise
as an actual value, TestCafe uses the smart assertion query mechanism:
if an assertion did not pass, the test does not fail immediately. The assertion retries to pass multiple times and
each time it requests the actual property value. The test fails if the assertion could not complete successfully
within a timeout:

![TestCafe Smart Assertion Query Mechanism](../../../images/assertions/query-mechanism.png)

**Example:**

The following web page is an example:

```html
<div id="btn"></div>
<script>
var btn = document.getElementById('btn');

btn.addEventListener(function() {
    window.setTimeout(function() {
        btn.innerText = 'Loading...';
    }, 100);
});
</script>
```

Test code for this page can be as follows.

```js
test('Button click', async t => {
    const btn = Selector('#btn');

    await t
        .click(btn)
        // A regular assertion will fail immediately, but TestCafe retries to run DOM state
        // assertions many times within the timeout until this assertion passes successfully.
        // The default timeout is 3000 ms.
        .expect(btn.textContent).contains('Loading...');
});
```

The approach described above allows you to create stable tests with a fast run-time that do not contain random errors.

You can specify the assertion query timeout in test code by using the [options.timeout](#assertion-options) option.
To set the timeout when launching tests, pass the timeout value to the [runner.run](../../using-testcafe/programming-interface/runner.md#run)
method if you use an API or specify the [assertion-timeout](../../using-testcafe/command-line-interface.md#--assertion-timeout-ms) option
if you run TestCafe from the command line.

## Assertion options

### options.timeout

**Type**: Number

The time (in milliseconds) an assertion can take to pass before the test fails if
[a selector property](../selecting-page-elements/selectors/using-selectors.md#define-assertion-actual-value)
or a [client function](../obtaining-data-from-the-client/README.md) promise was used in assertion.

**Default value**: The timeout is specified using the [runner.run](../../using-testcafe/programming-interface/runner.md#run) API method
or the [assertion-timeout](../../using-testcafe/command-line-interface.md#--assertion-timeout-ms) command line option.

```js
await t.expect(Selector('#elementId').innerText).eql('text', 'check element text', { timeout: 500 });
```

> In addition to built-in assertions, you also can use assertions from Node's built-in [assert](https://nodejs.org/api/assert.html) module or 3rd-party library (for example [chai](http://chaijs.com/)).
> In this case, you specify the time required to complete asynchronous actions using the [t.wait(timeout)](../pausing-the-test.md) method.