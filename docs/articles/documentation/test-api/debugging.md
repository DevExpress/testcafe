---
layout: docs
title: Debugging
permalink: /documentation/test-api/debugging.html
checked: true
---
# Debugging

TestCafe allows you to debug server-side test code and test behavior on the client.

* [Debugging Test Code](#debugging-test-code)
* [Client-Side Debugging](#client-side-debugging)
* [Options Useful for Debugging](#options-useful-for-debugging)

## Debugging Test Code

You can debug test code in Chrome Developer Tools and popular IDEs. See the following recipes for details.

* [Debugging with Chrome Developer Tools](../recipes/debugging-with-chrome-dev-tools.md)
* [Debugging with Visual Studio Code](../recipes/debugging-with-visual-studio-code.md)

## Client-Side Debugging

TestCafe provides the `t.debug` method that pauses the test and allows you to debug using the browser's developer tools.

```text
t.debug()
```

When test execution reaches `t.debug`, it pauses so that you can open browser's developer tools
and check the web page state, the location of DOM elements, their CSS styles, etc.

The footer displays buttons that allow you to continue test execution or step to the next test action.

![Page Footer when Debugging on a Client](../../images/debugging/client-debugging-footer.png)

> The debugger does not stop at creating and resolving the [selectors](selecting-page-elements/selectors.md) and [client functions](obtaining-data-from-the-client.md).

TestCafe logs points in code where the debugger stopped.

![Logging Debugger Breakpoints](../../images/debugging/log-debugger.png)

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

## Options Useful for Debugging

TestCafe includes a few features helpful when you need to find the cause of issues in your tests.

### Screenshots

You can specify that a screenshot should be taken in a particular place in a test.
Use the [t.takeScreenshot](actions/take-screenshot.md) action for this.

```js
fixture `My fixture`
    .page `https://devexpress.github.io/testcafe/example`;


test('My test', async t => {
    await t
        .setNativeDialogHandler(() => true)
        .takeScreenshot('./screenshots')
        .click('#populate')
        .takeScreenshot('./screenshots')
        .click('#submit-button');
});
```

You can also turn on the [--screenshots-on-fails](../using-testcafe/command-line-interface.md#-s---screenshots-on-fails)
option.

```sh
testcafe chrome ./my-tests --screenshots ./screenshots --screenshots-on-fails
```

This option enables TestCafe to take a screenshot automatically when a test fails.

Analyzing these screenshots helps save time on debugging and allows you to determine the reason of issues earlier.

### Test Speed

TestCafe provides the capability to change test speed. By default, tests are executed at full speed with minimum delays between actions and assertions.
This makes it hard to identify problems visually when running the test.
To slow down the test, use the [--speed](../using-testcafe/command-line-interface.md#--speed-factor)
CLI flag. You can use values from `1` to `0.01`.

```sh
testcafe chrome ./my-tests --speed 0.1
```

When tests run slowly, you can monitor test execution more easily and notice when test behavior differs from the one that's expected.