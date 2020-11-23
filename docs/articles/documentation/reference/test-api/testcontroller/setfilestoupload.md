---
layout: docs
title: t.setFilesToUpload Method
permalink: /documentation/reference/test-api/testcontroller/setfilestoupload.html
---
# t.setFilesToUpload Method

Sets files to upload. Emulates a user's selection in the browser's 'Choose File' dialog. Target element must be an `<input>` with the `type="file"` attribute.

```text
t.setFilesToUpload(selector, filePath) → this | Promise<any>
```

Parameter  | Type                                              | Description
---------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------
`selector` | Function &#124; String &#124; Selector &#124; Snapshot &#124; Promise | Identifies the input field to which file paths are written. See [Select Target Elements](#select-target-elements).
`filePath` | String &#124; Array                                            | The path(s) to the uploaded file. Relative paths are resolved against the folder with the test file.

The following example illustrates how to use the `t.setFilesToUpload` action:

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

> If an error occurs while files are being uploaded, the test will fail.

The [t.clearUpload](clearupload.md) method allows you to remove files added with `t.setFilesToUpload`.

## Select Target Elements

{% include actions/selector-parameter.md %}
