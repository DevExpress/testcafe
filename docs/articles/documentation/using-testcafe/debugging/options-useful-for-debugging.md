---
layout: docs
title: Options Useful for Debugging
permalink: /documentation/test-api/debugging/options-useful-for-debugging.html
---
# Options Useful for Debugging

TestCafe includes a few features helpful when you need to find the cause of issues in your tests.

## Screenshots

You can specify that a screenshot should be taken in a particular place in a test.
Use the [t.takeScreenshot](../test-api/actions/take-screenshot.md) action for this.

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

You can also turn on the [--screenshots-on-fails](../using-testcafe/command-line-interface.html#-s---screenshots-on-fails)
option.

```sh
testcafe chrome ./my-tests --screenshots ./screenshots --screenshots-on-fails
```

This option enables TestCafe to take a screenshot automatically when a test fails.

Analyzing these screenshots helps save time on debugging and allows you to determine the reason of issues earlier.

## Test Speed

TestCafe provides the capability to change test speed. By default, tests are executed at full speed with minimum delays between actions and assertions.
This makes it hard to identify problems visually when running the test.
To slow down the test, use the [--speed](../using-testcafe/command-line-interface.html#--speed-factor)
CLI flag. You can use values from `1` to `0.01`.

```sh
testcafe chrome ./my-tests --speed 0.1
```

When tests run slowly, you can monitor test execution more easily and notice when test behavior differs from the one that's expected.