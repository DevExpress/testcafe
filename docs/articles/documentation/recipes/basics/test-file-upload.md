---
layout: docs
title: Test File Upload
permalink: /documentation/recipes/basics/test-file-upload.html
---
# Test File Upload

This recipe shows how to test file upload functionality in your application with TestCafe.

[Full Example Code](https://github.com/DevExpress/testcafe-examples/tree/master/examples/upload-files)

Assume the following HTML:

```html
<body>
    <input id="fileElement" type="file" name="files[]" multiple style="display:none" />
    <button id="fileSelect">Select some files</button>

    <button type="button" id="submitBtn">Upload Files</button>

    <script>
        const submitButton = document.getElementById('submitBtn'),
               fileElement = document.getElementById('fileElement'),
                fileSelect = document.getElementById('fileSelect');

        fileSelect.addEventListener('click', e => {
            if (fileElement) { fileElement.click(); }
        });

        submitButton.addEventListener('click', e => {
            const fileList = document.getElementById('fileElement').files,
                  formData = new FormData();

            for (file of fileList){
                formData.append('files[]', file);
            };
            fetch('http://localhost:3000/upload', {
                method: 'post',
                body: formData,
            })
            .then(response => console.log(response))
        });
    </script>
</body>
```

This application utilizes the [JavaScript File API](https://developer.mozilla.org/en-US/docs/Web/API/File/Using_files_from_web_applications) for file upload. Users would usually perform the following actions to upload files:

* Click the 'Choose File' button that opens the native 'Choose file' dialog in the browser
* Select the files
* Begin the upload

Since TestCafe cannot interact with the native dialog, it uses a custom way to manipulate a list of files to upload.

To upload files, TestCafe requires an `<input>` element with the `type="file"` attribute.

The sample page includes an `<input>` element that holds the selected files. The element is hidden the with `display:none` style property.

To interact with the element, another button is present on the page, which redirects clicks to the `<input>`. With files selected, user can press the `Submit` button which [fetches](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) the files to the server.

Below you can find full test code and a step-by-step explanation.

```js
import { Selector } from 'testcafe';

fixture `My fixture`
    .page `./index.html`

test('Select files to upload', async t => {
    const fileElement = Selector('input').withAttribute('type','file'),
            submitBtn = Selector('#submitBtn');

    await t
        .setFilesToUpload(fileElement, [
            './uploads/text-file.txt',
            './uploads/text-file2.txt'
        ])
        .click(submitBtn);
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

Next, specify a selector that identifies the `<input>` element and the 'Submit' button.

```js
const fileElement = Selector('input').withAttribute('type','file'),
        submitBtn = Selector('#submitBtn');
```

Use the first selector and the [setFilesToUpload](../../reference/test-api/testcontroller/setfilestoupload.md) Method to populate the `<input>` with files. Then use the second selector to [click](../../reference/test-api/testcontroller/click.md) the 'Submit' button.

```js
await t
        .setFilesToUpload(fileElement, [
            './uploads/text-file.txt',
            './uploads/text-file2.txt'
        ])
        .click(submitBtn);
```

With that, the selected files are submitted to the server. Note that you don't actually click the `<input>` element itself to select files with TestCafe. Such a click would call a native file selection dialog, which TestCafe can't close or otherwise interact with.

If you don't actually need to upload files during test execution, use the [clearUpload](../../reference/test-api/testcontroller/clearupload.md) action to empty the `<input>`.
