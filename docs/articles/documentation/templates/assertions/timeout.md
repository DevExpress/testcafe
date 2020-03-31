**Type**: Number

The time (in milliseconds) an assertion can take to pass before the test fails if
[a selector property](../../guides/basic-guides/select-page-elements.md#define-assertion-actual-value)
or [client function](../../guides/basic-guides/obtain-data-from-the-client.md) promise was used in assertion.

**Default value**: The timeout is specified using the [runner.run](../../using-testcafe/programming-interface/runner.md#run) API method
or the [assertion-timeout](../../using-testcafe/command-line-interface.md#--assertion-timeout-ms) command line option.

```js
await t.expect(Selector('#elementId').innerText).eql('text', 'check element text', { timeout: 500 });
```

> In addition to built-in assertions, you also can use assertions from Node's built-in [assert](https://nodejs.org/api/assert.html) module or 3rd-party library (for example [chai](http://chaijs.com/)).
> In this case, specify the time required to complete asynchronous actions using the [t.wait(timeout)](../../reference/test-api/testcontroller/wait.md) method.
