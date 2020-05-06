**Type**: Number

The time (in milliseconds) an assertion can take to pass before the test fails if
[a selector property](/testcafe/documentation/guides/basic-guides/select-page-elements.html#define-assertion-actual-value)
or [client function](/testcafe/documentation/guides/basic-guides/obtain-client-side-info.html) promise is used.

**Default value**: The timeout is specified with the [runner.run](/testcafe/documentation/reference/testcafe-api/runner/run.html) API method
or the [assertion-timeout](/testcafe/documentation/reference/command-line-interface.html#--assertion-timeout-ms) command line option.

```js
await t.expect(Selector('#elementId').innerText).eql('text', 'check element text', { timeout: 500 });
```

> In addition to built-in assertions, you also can use assertions from Node.js's [assert](https://nodejs.org/api/assert.html) module or 3rd-party library (for example [chai](http://chaijs.com/)).
> In this case, specify the time required to complete asynchronous actions with the [t.wait(timeout)](/testcafe/documentation/reference/test-api/testcontroller/wait.html) method.
