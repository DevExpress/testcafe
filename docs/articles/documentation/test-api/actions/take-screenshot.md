---
layout: docs
title: Take Screenshot
permalink: /documentation/test-api/actions/take-screenshot.html
checked: true
---
# Take Screenshot

Takes a screenshot of the tested page.

**Note**: this action requires a [ICCCM/EWMH-compliant window manager](https://en.wikipedia.org/wiki/Comparison_of_X_window_managers) on Linux.

```text
t.takeScreenshot( [path] )
```

Parameter           | Type   | Description                                                                                           | Default
------------------- | ------ | ----------------------------------------------------------------------------------------------------- | ----------
`path`&#160;*(optional)* | String | The relative path and the name of the screenshot file to be created. Resolved from the *screenshot directory* specified by using the [runner.screenshots](../../using-testcafe/programming-interface/runner.md#screenshots) API method or the [screenshots-path](../../using-testcafe/command-line-interface.md#-s-path---screenshots-path) command line option. | `{currentDate}\test-{testIndex}\{userAgent}\{screenshotIndex}.png`; `{currentDate}\test-{testIndex}\run-{quarantineAttempt}\{userAgent}\{screenshotIndex}.png` if quarantine mode is enabled.

> Important! If the screenshot directory is not specified with the [runner.screenshots](../../using-testcafe/programming-interface/runner.md#screenshots) API method or the [screenshots-path](../../using-testcafe/command-line-interface.md#-s-path---screenshots-path) command line option,
> the `t.takeScreenshot` action is ignored.

The following example shows how to use the `t.takeScreenshot` action.

```js
fixture `My fixture`
    .page `http://www.example.com/`;

test('Take a screenshot of my new avatar', async t => {
    await t
        .click('#change-avatar')
        .setFilesToUpload('#upload-input', 'img/portrait.jpg')
        .click('#submit')
        .takeScreenshot('my-fixture/test1.png');
});
```
