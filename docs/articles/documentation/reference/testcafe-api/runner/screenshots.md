---
layout: docs
title: Runner.screenshots Method
permalink: /documentation/reference/testcafe-api/runner/screenshots.html
---
# Runner.screenshots Method

Specifies how TestCafe should take screenshots of the tested pages.

```text
screenshots(options) → this
obsolete: screenshots(path [, takeOnFails] [, pathPattern] ) → this
```

The `options` object can include the following properties:

Option           | Type    | Description                                                                   | Default
-------------------------- | ------- | ----------------------------------------------------------------------------- | -------
`path`&#160;*(optional)*   | String  | The base path where the screenshots are saved. Note that to construct a complete path to these screenshots, TestCafe uses the default [path patterns](../../../guides/advanced-guides/screenshots-and-videos.md#default-path-pattern). You can override these patterns with the `pathPattern` property. | `'./screenshots'`
`takeOnFails`&#160;*(optional)* | Boolean | Specifies if screenshots should be taken automatically when a test fails. | `false`
`pathPattern`&#160;*(optional)* | String | The pattern to compose screenshot files' relative path and name. See [Path Pattern Placeholders](../../../guides/advanced-guides/screenshots-and-videos.md#path-pattern-placeholders) for information about the available placeholders.
`fullPage`&#160;*(optional)*    | Boolean | Specifies that the full page should be captured, including content that is not visible due to overflow. | `false`

See [Screenshots](../../../guides/advanced-guides/screenshots-and-videos.md#screenshots) for details.

Pass the `disableScreenshots` option to the [runner.run](run.md) method to disable screenshots:

```js
runner.run({
    disableScreenshots: true
});
```

*Related configuration file properties*:

* [screenshots.path](../../configuration-file.md#screenshotspath)
* [screenshots.takeOnFails](../../configuration-file.md#screenshotstakeonfails)
* [screenshots.pathPattern](../../configuration-file.md#screenshotspathpattern)

**Example**

```js
runner.screenshots({
    path: 'reports/screenshots/',
    takeOnFails: true,
    pathPattern: '${DATE}_${TIME}/test-${TEST_INDEX}/${USERAGENT}/${FILE_INDEX}.png'
});
```
