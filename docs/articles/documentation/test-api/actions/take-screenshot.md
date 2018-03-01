---
layout: docs
title: Take Screenshot
permalink: /documentation/test-api/actions/take-screenshot.html
checked: true
---
# Take Screenshot

This topic describes how you can take screenshots of the tested page.

**Note**: these actions require a [ICCCM/EWMH-compliant window manager](https://en.wikipedia.org/wiki/Comparison_of_X_window_managers) on Linux.

> Important! If the screenshot directory is not specified with the [runner.screenshots](../../using-testcafe/programming-interface/runner.md#screenshots) API method or the [screenshots](../../using-testcafe/command-line-interface.md#-s-path---screenshots-path) command line option,
> the screenshot actions are ignored.

## Take a Screenshot of the Entire Page

```text
t.takeScreenshot( [path] )
```

Parameter           | Type   | Description
------------------- | ------ | -----------------------------------------------------------------------------------------------------
`path`&#160;*(optional)* | String | The relative path and the name of the screenshot file to be created. Resolved from the *screenshot directory* specified by using the [runner.screenshots](../../using-testcafe/programming-interface/runner.md#screenshots) API method or the [screenshots](../../using-testcafe/command-line-interface.md#-s-path---screenshots-path) command line option.

By default, the path to which screenshots are saved is specified as:

* `{currentDate}\test-{testIndex}\{userAgent}\{screenshotIndex}.png` if the [quarantine mode](../../using-testcafe/command-line-interface.md#-q---quarantine-mode) is disabled;
* `{currentDate}\test-{testIndex}\run-{quarantineAttempt}\{userAgent}\{screenshotIndex}.png` if the [quarantine mode](../../using-testcafe/command-line-interface.md#-q---quarantine-mode) is enabled.

The following example shows how to use the `t.takeScreenshot` action.

```js
import { Selector } from 'testcafe';

fixture `My fixture`
    .page `http://devexpress.github.io/testcafe/example/`;

test('Take a screenshot of a fieldset', async t => {
    await t
        .typeText('#developer-name', 'Peter Parker')
        .click('#submit-button')
        .takeScreenshot('my-fixture/thank-you-page.png');
});
```

## Take a Screenshot of a Page Element

```text
t.takeElementScreenshot(selector[, path][, options])
```

Takes a screenshot of the specified page element.

Parameter                | Type   | Description
------------------------ | ------ | -----------------------------------------------------------------------------------------------------
`selector`               | Function &#124; String &#124; Selector &#124; Snapshot &#124; Promise | Identifies the webpage element whose screenshot will be taken. See [Selecting Target Elements](README.md#selecting-target-elements).
`path`&#160;*(optional)* | String | The relative path and the name of the screenshot file to be created. Resolved from the *screenshot directory* specified by using the [runner.screenshots](../../using-testcafe/programming-interface/runner.md#screenshots) API method or the [screenshots](../../using-testcafe/command-line-interface.md#-s-path---screenshots-path) command line option.
`options`&#160;*(optional)*   | Object | Options that define how the screenshot will be taken. See details below.

```js
import { Selector } from 'testcafe';

fixture `My fixture`
    .page `http://devexpress.github.io/testcafe/example/`;

test('Take a screenshot of a fieldset', async t => {
    await t
        .click('#reusing-js-code')
        .click('#continuous-integration-embedding')
        .takeElementScreenshot(Selector('fieldset').nth(1), 'my-fixture/important-features.png');
});
```

By default, the path to which screenshots are saved is specified as:

* `{currentDate}\test-{testIndex}\{userAgent}\{screenshotIndex}.png` if the [quarantine mode](../../using-testcafe/command-line-interface.md#-q---quarantine-mode) is disabled;
* `{currentDate}\test-{testIndex}\run-{quarantineAttempt}\{userAgent}\{screenshotIndex}.png` if the [quarantine mode](../../using-testcafe/command-line-interface.md#-q---quarantine-mode) is enabled.

The `options` object contains the following properties.

Property        | Type | Description   | Default
--------------- | ---- | ------------- | ----------
`scrollTargetX`,&#160;`scrollTargetY` | Number | If the target element is too big to fit into the browser window, the page will be scrolled to put this point to the center of the viewport. The coordinates of this point are calculated relative to the target element. If the numbers are positive, the point is positioned relative to the top-left corner of the element. If the numbers are negative, the point is positioned relative to the bottom-right corner. If the target element fits into the browser window, these properties have no effect. | The center of the element. If the `crop` rectangle is specified, its center. If the `crop` rectangle is larger than the viewport, the center of the viewport.
`includeMargins` | Boolean | Specifies whether to include target element's margins in the screenshot. When it is enabled, the `scrollTargetX`, `scrollTargetY` and `crop` rectangle coordinates are calculated from the corners where top and left (or bottom and right) margins intersect. | `false`
`includeBorders` | Boolean | Specifies whether to include target element's borders in the screenshot. When it is enabled, the `scrollTargetX`, `scrollTargetY` and `crop` rectangle coordinates are calculated from the corners where top and left (or bottom and right) internal edges of the element intersect. | `true`
`includePaddings` | Boolean | Specifies whether to include target element's paddings in the screenshot. When it is enabled, the `scrollTargetX`, `scrollTargetY` and `crop` rectangle coordinates are calculated from the corners where top and left (or bottom and right) edges of the element's content area intersect. | `true`
`crop`           | Object  | Allows you to crop the target element on the screenshot. | Crops to the whole element or, if it does not fit into the viewport, its visible part.

An object assigned to the `crop` property has the following fields.

Field    | Type   | Description
-------- | ------ | --------------
`top`    | Number | The top edge of the cropping rectangle. The coordinate is calculated from the element's top edge. If a negative number is passed, the coordinate is calculated from the element's bottom edge.
`left`   | Number | The left edge of the cropping rectangle. The coordinate is calculated from the element's left edge. If a negative number is passed, the coordinate is calculated from the element's right edge.
`bottom` | Number | The bottom edge of the cropping rectangle. The coordinate is calculated from the element's top edge. If a negative number is passed, the coordinate is calculated from the element's bottom edge.
`right`  | Number | The right edge of the cropping rectangle. The coordinate is calculated from the element's left edge. If a negative number is passed, the coordinate is calculated from the element's right edge.

![Crop Rectangle](../../../images/screenshot-crop.png)

**Example**

```js
fixture `My fixture`
    .page `http://www.example.com/`;

test('Take a screenshot of my new avatar', async t => {
    await t
        .click('#change-avatar')
        .setFilesToUpload('#upload-input', 'img/portrait.jpg')
        .click('#submit')
        .takeElementScreenshot('#avatar', {
            includeMargins: true,
            crop: {
                top: -100,
                left: 10,
                bottom: 30,
                right: 200
            }
        });
});
```