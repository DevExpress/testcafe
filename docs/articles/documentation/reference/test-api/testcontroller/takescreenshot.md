---
layout: docs
title: t.takeScreenshot Method
permalink: /documentation/reference/test-api/testcontroller/takescreenshot.html
---
# t.takeScreenshot Method

Takes screenshot of the entire page.

```text
t.takeScreenshot( [options] )
obsolete: t.takeScreenshot( [path] )
```

The `options` object can include the following properties:

Parameter           | Type   | Description | Default Value
------------------- | ------ | ----------- | ----------
`path`&#160;*(optional)* | String | The screenshot file's relative path and name. The path is relative to the root directory specified in the [runner.screenshots](../../testcafe-api/runner/screenshots.md) API method or the [-s (--screenshots)](../../command-line-interface.md#-s---screenshots-optionvalueoption2value2) command line option. This property overrides the relative path specified with the default or custom [path patterns](../../../guides/advanced-guides/screenshots-and-videos.md#screenshot-and-video-directories).
`fullPage`&#160;*(optional)* | Boolean | Specifies that the full page should be captured, including content that is not visible due to overflow. | `false`

The following example shows how to use the `t.takeScreenshot` action.

```js
import { Selector } from 'testcafe';

fixture `My fixture`
    .page `http://devexpress.github.io/testcafe/example/`;

test('Take a screenshot of a fieldset', async t => {
    await t
        .typeText('#developer-name', 'Peter Parker')
        .click('#submit-button')
        .takeScreenshot({
            path:     'my-fixture/thank-you-page.png',
            fullPage: true
        });
});
```

You can also take a screenshot of a specified element with the [t.takeElementScreenshot](takeelementscreenshot.md) method.

See [Screenshots and Videos](../../../guides/advanced-guides/screenshots-and-videos.md) for more information on taking screenshots.
