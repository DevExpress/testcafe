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
`path`&#160;*(optional)* | String | A relative path to the folder where screenshots should be saved. Resolved from the *screenshot directory* specified by using the [runner.screenshots](../../using-testcafe/programming-interface/runner.md#screenshots) API method or the [screenshots-path](../../using-testcafe/command-line-interface.md#-s-path---screenshots-path) command line option. | The screenshot directory specified by using [runner.screenshots](../../using-testcafe/programming-interface/runner.md#screenshots) or [screenshots-path](../../using-testcafe/command-line-interface.md#-s-path---screenshots-path).

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
        .takeScreenshot();
});
```
