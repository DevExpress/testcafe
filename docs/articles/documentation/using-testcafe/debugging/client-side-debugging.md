---
layout: docs
title: Client-Side Debugging
permalink: /documentation/using-testcafe/debugging/client-side-debugging.html
---
# Client-Side Debugging

TestCafe provides the `t.debug` method that pauses the test and allows you to debug using the browser's developer tools.

```text
t.debug()
```

When test execution reaches `t.debug`, it pauses so that you can open browser's developer tools
and check the web page state, the location of DOM elements, their CSS styles, etc.

The footer displays buttons that allow you to continue test execution or step to the next test action.

![Page Footer when Debugging on a Client](../../../images/debugging/client-debugging-footer.png)

> The debugger does not stop at creating and resolving the [selectors](../../test-api/selecting-page-elements/selectors.md) and [client functions](../../test-api/obtaining-data-from-the-client.md).

TestCafe logs points in code where the debugger stopped.

![Logging Debugger Breakpoints](../../../images/debugging/log-debugger.png)

**Example**

```js
fixture `Debugger example`
    .page `http://devexpress.github.io/testcafe/example/`;

test('Debugger', async t => {
    await t
        .debug()
        .setNativeDialogHandler(() => true)
        .click('#populate')
        .click('#submit-button');
});
```