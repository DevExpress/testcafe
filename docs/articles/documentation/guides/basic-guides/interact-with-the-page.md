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
# Interact With the Page

Test API includes a set of **actions** you can use to interact with the page.

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

The [test controller](../../reference/test-api/testcontroller/README.md) object includes actions as its methods. You can chain these actions when you call them in code.

You can find a list of available actions (with reproducible examples) and links to their descriptions below.

> TestCafe is intended to emulate real user behavior, so you cannot interact with elements, that are not [visible](../../reference/test-api/selector/filtervisible.md) at that moment.
>
> For instance, you can not type into an `input` element with the `display: none` style.

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

Actions that allow you to manipulate the state of file upload input elements:

* [t.setFilesToUpload](../../reference/test-api/testcontroller/setfilestoupload.md)
* [t.clearUpload](../../reference/test-api/testcontroller/clearupload.md)

Use the [t.setFilesToUpload](../../reference/test-api/testcontroller/setfilestoupload.md) action to populate the input with the files you want to upload. If your application sends files as soon as you populate the field, the upload occurs when you call this action. Otherwise, you will have to begin the upload manually (for example, [click](../../reference/test-api/testcontroller/click.md) the submit button).

Use the [t.clearUpload](../../reference/test-api/testcontroller/clearupload.md) action to clear the list of files to upload.

See the [Test File Upload](../../recipes/basics/test-file-upload.md) recipe for more details.

> The t.setFilesToUpload action only works with `<input type="file">` HTML elements, because browsers use these elements to upload files.

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

## Work With Iframes

A TestCafe test's [browsing context](https://html.spec.whatwg.org/multipage/browsers.html#windows) is limited to the main window or an `<iframe>`. To use an `<iframe>` in your test,
switch the context from the main window to this `<iframe>`. You may need to switch back to the main window.
If multiple `<iframes>` are present in your test, you should switch between them.

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

TestCafe allows you to handle native dialogs that the browser may display during the test run.

You can close [alert](https://developer.mozilla.org/en-US/docs/Web/API/Window/alert) and
[beforeunload](https://developer.mozilla.org/en-US/docs/Web/Events/beforeunload) dialogs,
choose an option in [confirm](https://developer.mozilla.org/en-US/docs/Web/API/Window/confirm) dialogs
or supply text for [prompt](https://developer.mozilla.org/en-US/docs/Web/API/Window/prompt) dialogs.

* [Set Native Dialog Handler](../../reference/test-api/testcontroller/setnativedialoghandler.md)
* [Get Native Dialog History](../../reference/test-api/testcontroller/getnativedialoghistory.md)

## Resize Window

Use resize window actions to maximize a browser window or resize it to fit a specified width and height or type of device.

* [Resize Window](../../reference/test-api/testcontroller/resizewindow.md)
* [Resize Window to Fit Device](../../reference/test-api/testcontroller/resizewindowtofitdevice.md)
* [Maximize Window](../../reference/test-api/testcontroller/maximizewindow.md)

> Important! Window resize actions are not supported when you run tests in [remote browsers](../concepts/browsers.md#browsers-on-remote-devices).

**Note**: These actions require a Windows machine with .NET 4.0 or newer, or a Linux machine with an [ICCCM/EWMH-compliant window manager](https://en.wikipedia.org/wiki/Comparison_of_X_window_managers).

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
`mousemove` (when you hover or drag) | `touchmove` (when you drag)
`mousedown` | `touchstart`
`mouseup`   | `touchend`

## Interaction Requirements

TestCafe actions can interact with elements if they satisfy the following conditions:

* an element is within the `body` element of a page window or an [`<iframe>`](#work-with-iframes) window. The element can be invisible to the user. If an element is outside of the viewport, TestCafe tries to reach it with a scroll.

* an element is visible, with the following properties:

    Property | Value
    -------- | --------
    `display`  | *not* set to `none`
    `visibility` | set to `visible` (the default value)
    `width`    | >= 1px
    `height`   | >= 1px

* an element is not overlapped.  

    TestCafe actions target the center of an element or a point specified by an action's `offsetX` and `offsetY` options. If another element obstructs the target point, the action is executed on the top element (for instance, the [t.click](../../reference/test-api/testcontroller/click.md) action clicks the element over it).

## Examples

### Download Files in IE

TestCafe cannot prevent native dialogs before file download in Internet Explorer. This dialog prevents automatic file download, but does not block the page.

The following example shows how to ignore the dialog and download the file:

```html
<body>
    <form method="get" action="./src/file.zip">
        <button id="downloadButton" type="submit">Download!</button>
     </form>
</body>
```

This sample page includes a button that downloads a file from the `/src` folder on the server. To obtain the file, use a [RequestLogger](../../reference/test-api/requestlogger/README.md):

```js
import { RequestLogger } from 'testcafe';

const fileDownloadLogger = RequestLogger(new RegExp('src/file.zip'), {
    logResponseBody: true,
    stringifyResponseBody: true
});

fixture `fixture`
    .page `./fileDownload.html`
    .requestHooks(fileDownloadLogger);

test(`Download a file and verify contents`, async t => {
    await t
        .click('#downloadButton')
        .expect(fileDownloadLogger.contains(r => {
            return  /File contents here/.test(r.response.body) &&   //verify response body
                    r.response.statusCode === 200;                  //verify response status code
        })).ok()
});
```

This test introduces a `RequestLogger` that logs requests to a location and received responses. Location is [defined with a regular expression](../../reference/test-api/requestlogger/constructor.md#use-a-regular-expression-to-specify-the-url). The response body is then checked with a regular expression.

> The response body received from the server is binary. Use the `RequestLogger`'s [stringifyResponseBody option](../../reference/test-api/requestlogger/constructor.md) to convert it to a string.

### Scroll an Element into View

Since TestCafe scrolls to reach items that are on the page but not on-screen, the TestCafe API does not have a dedicated scroll action.

You can use any action (for example, [hover](#hover)) to scroll towards the desired part of the page.  

If you specifically need to scroll the page without any action, use a [ClientFunction](obtain-client-side-info.md).

```js
import { ClientFunction } from 'testcafe';

const scrollBy = ClientFunction(() => {
    window.scrollBy(0, 1000);
});

test('Test', async t => {
      await scrollBy();
});
```
