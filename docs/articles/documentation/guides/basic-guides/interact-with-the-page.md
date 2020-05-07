---
layout: docs
title: Interact With The Page
permalink: /documentation/guides/basic-guides/interact-with-the-page.html
redirect_from:
  - /documentation/test-api/actions/
  - /documentation/test-api/actions/action-options.html
  - /documentation/test-api/actions/drag-element.html
  - /documentation/test-api/actions/resize-window.html
  - /documentation/test-api/actions/select-text.html
  - /documentation/test-api/actions/take-screenshot.html
  - /documentation/test-api/actions/upload.html
  - /documentation/test-api/
  - /documentation/test-api/a-z.html
  - /documentation/test-api/handling-native-dialogs.html
  - /documentation/test-api/working-with-iframes.html
---
# Interact With The Page

Test API provides a set of **actions** you can use to interact with the page.

* [Click](#click)
* [Press Key](#press-key)
* [Navigate](#navigate)
* [Type Text](#type-text)
* [Select Text](#select-text)
* [Hover](#hover)
* [Drag Elements](#drag-elements)
* [Upload Files](#upload-files)
* [Take Screenshot](#take-screenshot)
* [Work with iframes](#work-with-iframes)
* [Handle Native Dialogs](#handle-native-dialogs)
* [Resize Window](#resize-window)
* [Wait](#wait)

They are implemented as methods in the [test controller](../../reference/test-api/testcontroller/README.md) object. You can call them in a chained fashion.

The available actions with reproducible usage examples and links to their descriptions are listed below.

## Click

Click actions allow you to click an element on a page.

* [Click](../../reference/test-api/testcontroller/click.md)
* [Double-Click](../../reference/test-api/testcontroller/doubleclick.md)
* [Right-Click](../../reference/test-api/testcontroller/rightclick.md)

**Example**

```js
import { Selector } from 'testcafe';

fixture `Example`
    .page `https://devexpress.github.io/testcafe/example/`;

test('Click test', async t => {
    const selectBasedOnText = Selector('label').withText('I have tried TestCafe');

    await t
        .click(selectBasedOnText);
});
```

## Press Key

[Press Key](../../reference/test-api/testcontroller/presskey.md) action allows you to press a key or key combination.

**Example**

```js
import { Selector } from 'testcafe';

fixture `Example`
    .page `https://devexpress.github.io/testcafe/example/`;

test('Press Key test', async t => {
    await t
        .click('#tried-test-cafe')
        // pressing 'Space' imitates clicking the checkbox again
        .pressKey('space')
});
```

## Navigate

[Navigate](../../reference/test-api/testcontroller/navigateto.md) action navigates to the specified URL.

**Example**

```js
import { Selector } from 'testcafe';

fixture `Example`
    .page `https://devexpress.github.io/testcafe/example/`;

test('Navigate To URL test', async t => {
    await t
        .navigateTo('https://github.com/DevExpress/testcafe');
});
```

## Type Text

[Type Text](../../reference/test-api/testcontroller/typetext.md) action types the specified text in the selected input element.

**Example**

```js
import { Selector } from 'testcafe';

fixture `Example`
    .page `https://devexpress.github.io/testcafe/example/`;

test('Type Text test', async t => {
    await t
        .typeText('#developer-name', 'John Doe');
});
```

## Select Text

Actions that allow you to select text in inputs, `<textarea>`, and `contentEditable` elements.

* [Select Text in Input Elements](../../reference/test-api/testcontroller/selecttext.md)
* [Select \<textarea\> Content](../../reference/test-api/testcontroller/selecttextareacontent.md)
* [Perform Selection within Editable Content](../../reference/test-api/testcontroller/selecteditablecontent.md)

**Example**

```js
import { Selector } from 'testcafe';

fixture `Example`
    .page `https://devexpress.github.io/testcafe/example/`;

test('Select Text test', async t => {
    await t
        .typeText('#developer-name', 'John Doe')
        .selectText('#developer-name')
        .pressKey('delete');
});
```

## Hover

[Hover](../../reference/test-api/testcontroller/hover.md) action allows you to hover the mouse pointer over the tested page.

**Example**

```js
import { Selector } from 'testcafe';

fixture `Example`
    .page `https://js.devexpress.com`;

test('Hover test', async t => {
    await t
        .hover('.map-container');
});
```

## Drag Elements

**Drag** actions allow you to drag elements on the tested page.

* [Drag an Element by an Offset](../../reference/test-api/testcontroller/drag.md)
* [Drag an Element onto Another One](../../reference/test-api/testcontroller/dragtoelement.md)

> The **drag** actions do not invoke integrated browser actions such as text selection.
> Use them to perform drag-and-drop actions that page elements process.
> To select text, use [t.selectText](../../reference/test-api/testcontroller/selecttext.md).

**Example**

```js
import { Selector } from 'testcafe';

fixture `Example`
    .page `https://devexpress.github.io/testcafe/example/`;

test('Drag test', async t => {
    const triedCheckbox = Selector('label').withText('I have tried TestCafe');

    await t
        .click(triedCheckbox)
        .drag('#slider', 360, 0, { offsetX: 10, offsetY: 10 });
});
```

## Upload Files

Actions that allow you to interact with file upload input elements.

* [Populate File Upload Input](../../reference/test-api/testcontroller/setfilestoupload.md)
* [Clear File Upload Input](../../reference/test-api/testcontroller/clearupload.md)

> The file upload actions only allow you to manage the list of files you want to upload. These files are uploaded to the server after you initiate upload, for example, when you [click](../../reference/test-api/testcontroller/click.md) the **Upload** or **Submit** button on a page.

**Example**

```js
import { Selector } from 'testcafe';

fixture `Example`
    .page `https://js.devexpress.com/Demos/WidgetsGallery/Demo/FileUploader/FileSelection/jQuery/Light/`;

test('Upload Files test', async t => {
    await t
        .switchToIframe('.demo-frame')
        .setFilesToUpload('.dx-fileuploader-input', [
            // substitute the following string with the path to a local file or multiple files you want to upload
            'path/to/file'
        ]);
});
```

## Take Screenshot

These actions allow you to take screenshots of the tested page.

* [Take Screenshot](../../reference/test-api/testcontroller/takescreenshot.md)
* [Take Element Screenshot](../../reference/test-api/testcontroller/takeelementscreenshot.md)

**Example**

```js
import { Selector } from 'testcafe';

fixture `Example`
    .page `https://js.devexpress.com`;

test('Take Screenshot test', async t => {
    await t
        .takeScreenshot()
        .takeElementScreenshot('.map-container');
});
```

## Work with iframes

A TestCafe test's [browsing context](https://html.spec.whatwg.org/multipage/browsers.html#windows) is limited to the main window or an `<iframe>`. To use an `<iframe>` in your test,
switch the context from the main window to this `<iframe>`.
If several `<iframes>` are used in your test, you need to switch between them.
limited to either the main window or an `<iframe>`. To use an `<iframe>` in your test,
you need to switch the context from the main window to this `<iframe>` (and then probably back).
Likewise, if several `<iframes>` are involved in your test, you will have to switch between them.

Use the following methods to switch between windows and iframes:

* [Switch To \<iframe\>](../../reference/test-api/testcontroller/switchtoiframe.md)
* [Switch To Main Window](../../reference/test-api/testcontroller/switchtomainwindow.md)

**Example**

```js
import { Selector } from 'testcafe';

fixture `Example`
    .page `https://js.devexpress.com/Demos/WidgetsGallery/Demo/DataGrid/Overview/jQuery/Light/`;

test('Working With iframe test', async t => {
    await t
        .switchToIframe('.demo-frame')
        .click('.dx-datagrid-group-panel')
        .switchToMainWindow();
});
```

## Handle Native Dialogs

TestCafe allows you to handle native browser dialogs that are invoked during the test run.

You can close [alert](https://developer.mozilla.org/en-US/docs/Web/API/Window/alert) and
[beforeunload](https://developer.mozilla.org/en-US/docs/Web/Events/beforeunload) dialogs,
choose an option in [confirm](https://developer.mozilla.org/en-US/docs/Web/API/Window/confirm) dialogs
or provide text for [prompt](https://developer.mozilla.org/en-US/docs/Web/API/Window/prompt) dialogs.

* [Set Native Dialog Handler](../../reference/test-api/testcontroller/setnativedialoghandler.md)
* [Get Native Dialog History](../../reference/test-api/testcontroller/getnativedialoghistory.md)

## Resize Window

Use resize window actions to maximize a browser window or resize it to fit a specified width and height or type of device.

* [Resize Window](../../reference/test-api/testcontroller/resizewindow.md)
* [Resize Window to Fit Device](../../reference/test-api/testcontroller/resizewindowtofitdevice.md)
* [Maximize Window](../../reference/test-api/testcontroller/maximizewindow.md)

> Important! Window resize actions are not supported when you run tests in [remote browsers](../concepts/browsers.md#browsers-on-remote-devices).

**Note**: these actions require .NET 4.0 or newer installed on Windows machines and an [ICCCM/EWMH-compliant window manager](https://en.wikipedia.org/wiki/Comparison_of_X_window_managers) on Linux.

**Example**

```js
import { Selector } from 'testcafe';

fixture `Example`
    .page `https://js.devexpress.com`;

test('Resize Window test', async t => {
    await t
        .resizeWindowToFitDevice('iphonexr')
        .maximizeWindow();
});
```

## Wait

[Wait](../../reference/test-api/testcontroller/wait.md) action allows you to pause the test for a specified period of time.

**Example**

```js
import { Selector } from 'testcafe';

fixture `Example`
    .page `https://js.devexpress.com`;

test('Wait test', async t => {
    await t
        .hover('.map-container')
        .wait(1000);
});
```

## Remarks for Touch Devices

On touch devices, TestCafe emulates touch events instead of mouse events.

Mouse event | Touch event
----------- | -------------
`mousemove` (when hovering or dragging) | `touchmove` (dragging only)
`mousedown` | `touchstart`
`mouseup`   | `touchend`
