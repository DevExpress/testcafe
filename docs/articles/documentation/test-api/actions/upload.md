---
layout: docs
title: Upload
permalink: /documentation/test-api/actions/upload.html
checked: true
---
# Upload

Use the following actions to work with file upload input elements.

* [Populate File Upload Input](#populate-file-upload-input)
* [Clear File Upload Input](#clear-file-upload-input)

> The [t.setFilesToUpload](#populate-file-upload-input) and [t.clearUpload](#clear-file-upload-input) actions only allow you to manage the list of files for upload. These files are uploaded to the server after you initiate upload, for example, when you [click](click.md) the **Upload** or **Submit** button on a webpage.

## Populate File Upload Input

Populates the specified file upload input with file paths.

```text
t.setFilesToUpload( selector, filePath )
```

Parameter  | Type                                              | Description
---------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------
`selector` | Function &#124; String &#124; Selector &#124; Snapshot &#124; Promise | Identifies the input field to which file paths are written. See [Selecting Target Elements](README.md#selecting-target-elements).
`filePath` | String &#124; Array                                            | The path to the uploaded file, or several such paths. Relative paths are resolved against the folder with the test file.

The following example illustrates how to use the `t.setFilesToUpload` action.

```js
fixture `My fixture`
    .page `http://www.example.com/`;

test('Uploading', async t => {
    await t
        .setFilesToUpload('#upload-input', [
            './uploads/1.jpg',
            './uploads/2.jpg',
            './uploads/3.jpg'
        ])
        .click('#upload-button');
});
```

The `t.setFilesToUpload` action removes all file paths from the input before populating it with new ones.

> If an error occurs while uploading files, the test will fail.

## Clear File Upload Input

Removes all file paths from the specified file upload input.

```text
t.clearUpload( selector )
```

Parameter  | Type                                              | Description
---------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------
`selector` | Function &#124; String &#124; Selector &#124; Snapshot &#124; Promise | Identifies the input field that needs to be cleared. See [Selecting Target Elements](README.md#selecting-target-elements).

The example below shows how to use the `t.clearUpload` action.

```js
import { Selector } from 'testcafe';

const uploadBtn = Selector('#upload-button');

fixture `My fixture`
    .page `http://www.example.com/`;

test('Trying to upload with no files specified', async t => {
    await t
        .setFilesToUpload('#upload-input', [
            './uploads/1.jpg',
            './uploads/2.jpg',
            './uploads/3.jpg'
        ])
        .clearUpload('#upload-input')
        .expect(uploadBtn.visible).notOk();
});
```
