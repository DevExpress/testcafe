---
layout: docs
title: Take Screenshot
permalink: /documentation/test-api/actions/take-screenshot.html
---
# Take Screenshot

Takes a screenshot of the tested page.

```text
t.takeScreenshot( [path] )
```

Parameter           | Type   | Description                                                                                           | Default
------------------- | ------ | ----------------------------------------------------------------------------------------------------- | ----------
`path` *(optional)* | String | A relative path to the folder where screenshots should be saved. Resolved from the *screenshot directory* specified via an [API](../../using-testcafe/programming-interface/runner.md#screenshots) or [CLI](../../using-testcafe/command-line-interface.md#-s-path---screenshots-path) option. | The screenshot directory specified via an [API](../../using-testcafe/programming-interface/runner.md#screenshots) or [command-line interface](../../using-testcafe/command-line-interface.md#-s-path---screenshots-path) option.

> Important! If the screenshot directory is not specified in [API](../../using-testcafe/programming-interface/runner.md#screenshots) or [command-line interface](../../using-testcafe/command-line-interface.md#-s-path---screenshots-path),
> the `t.takeScreenshot` action is ignored.

The following example shows how to use the `t.takeScreenshot` action.

```js
fixture `My fixture`
    .page('http://www.example.com/');

test('Take a screenshot of my new avatar', async t => {
    await t
        .click('#change-avatar')
        .setFilesToUpload('#upload-input', 'img/portrait.jpg')
        .click('#submit')
        .takeScreenshot();
});
```

> Important! This action is not yet available on Linux.
> See the corresponding [issue on Github](https://github.com/DevExpress/testcafe-browser-natives/issues/12).
