---
layout: docs
title: Test File Upload
permalink: /documentation/recipes/basics/test-file-upload.html
---
# Test File Upload

This recipe shows how to test your application's file upload functionality with TestCafe.

[Full Example Code](https://github.com/DevExpress/testcafe-examples/tree/master/examples/upload-files)

In the case of the following HTML:

```html
<body>
    <form action="http://localhost:3000/upload" method="post" enctype="multipart/form-data">
        <input id="upload-input" type="file" name="files" multiple />
        <input type="submit" id="upload-btn" value="Upload Files"/>
    </form>
</body>
```

TestCafe's file upload emulation is differrent from what a real user would do to upload files.

To manually upload files on this page, the user needs to perform the following steps:

* Click the 'Choose File' button that opens the 'Choose file' dialog in the browser
* Select the files
* Begin the upload

TestCafe cannot interact with the native dialog. It uses the `.setFilesToUpload` action to directly change the state of the `<input type="file">` element.

The sample page includes a `<form>` that contains:

* an `<input>` element that holds the selected files
* a `submit` button that initiates the file upload to the server.

Below is the full test code and a step-by-step explanation of the file upload process in TestCafe.

```js
import { Selector } from 'testcafe';

fixture `My fixture`
    .page `./index.html`

test('Check uploaded files', async t => {

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

test('Check uploaded files', async t => {
    // Here you will put test code.
});
```

Use the [setFilesToUpload](../../reference/test-api/testcontroller/setfilestoupload.md) method to populate the `<input>` with files. Then, [click](../../reference/test-api/testcontroller/click.md) the `submit` button.

```js
await t
        .setFilesToUpload('#upload-input', [
            './uploads/text-file-1.txt',
            './uploads/text-file-2.txt'
        ])
        .click('#upload-btn');
```

This sends the selected files to the server. Note that with TestCafe, you don't need to click the `<input type="file">` element itself to select the files.

You can use the [clearUpload](../../reference/test-api/testcontroller/clearupload.md) action to empty the `<input>`.
