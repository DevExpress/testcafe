---
layout: docs
title: Test File Upload
permalink: /documentation/recipes/basics/test-file-upload.html
---
# Test File Upload

This recipe shows how to test your application's file upload functionality with TestCafe.

[Full Example Code](https://github.com/DevExpress/testcafe-examples/tree/master/examples/upload-files)

Assume the following HTML:

```html
<body>
    <form action="http://localhost:3000/upload" method="post" enctype="multipart/form-data">
        <input id="upload-input" type="file" name="files" multiple />
        <input type="submit" id="upload-btn" value="Upload Files"/>
    </form>
</body>
```

This application utilizes the [JavaScript File API](https://developer.mozilla.org/en-US/docs/Web/API/File/Using_files_from_web_applications) for file upload. Users would usually perform the following actions to upload files:

* Click the 'Choose File' button that opens the 'Choose file' dialog in the browser
* Select the files
* Begin the upload

Since TestCafe cannot interact with the native dialog, it uses a custom way to manipulate a list of files to upload.

To upload files, TestCafe requires an `<input>` element with the `type="file"` attribute.

The sample page includes a `<form>` that contains:

* `<input>` element that holds the selected files
* the `submit` button that sends the files to the server.

Below you can find full test code and a step-by-step explanation.

```js
import { Selector } from 'testcafe';

fixture `My fixture`
    .page `./index.html`

test('Select files to upload', async t => {

    await t
        .setFilesToUpload('#upload-input', [
            './uploads/text-file-1.txt',
            './uploads/text-file-2.txt'
        ])
        .click('#upload-btn');
});
```

Start with an empty test.

```js
import { Selector } from 'testcafe';

fixture `My fixture`
    .page `./index.html`

test('Select files to upload', async t => {
    // Here you will put test code.
});
```

Use the [setFilesToUpload](../../reference/test-api/testcontroller/setfilestoupload.md) Method to populate the `<input>` with files. Then [click](../../reference/test-api/testcontroller/click.md) the `submit` button.

```js
await t
        .setFilesToUpload('#upload-input', [
            './uploads/text-file-1.txt',
            './uploads/text-file-2.txt'
        ])
        .click('#upload-btn');
```

This sends the selected files to the server. Note that with TestCafe you don't need to click the `<input type="file">` element itself to select the files. Such a click would call a native file selection dialog, which TestCafe can't close or otherwise interact with.

You can use the [clearUpload](../../reference/test-api/testcontroller/clearupload.md) action to empty the `<input>`.
