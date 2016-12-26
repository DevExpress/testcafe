---
layout: docs
title: Debug
permalink: /documentation/test-api/actions/debug.html
checked: true
---
# Debug

Pauses the test and allows you to debug using the browser's developer tools.

```text
t.debug()
```

When test execution reaches this action, it pauses so that you can open browser's developer tools
and check the web page state, the location of DOM elements, their CSS styles, etc.

The footer displays buttons that allow you to continue test execution or step to the next test action.

![Page Footer when Debugging on a Client](../../../images/debugging/client-debugging-footer.png)

**Example**

```js
fixture `Debugger example`
    .page `http://devexpress.github.io/testcafe/example/`;

test('Debugger', async t => {
    await t
        .click('#developer-name')
        .debug()
        .typeText('#developer-name', 'Peter Parker');
});
```