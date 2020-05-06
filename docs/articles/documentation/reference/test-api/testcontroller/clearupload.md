---
layout: docs
title: t.clearUpload Method
permalink: /documentation/reference/test-api/testcontroller/clearupload.html
---
# t.clearUpload Method

Removes all file paths from the specified file upload input.

```text
t.clearUpload( selector )
```

Parameter  | Type                                              | Description
---------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------
`selector` | Function &#124; String &#124; Selector &#124; Snapshot &#124; Promise | Identifies the input field that should be cleared. See [Select Target Elements](#select-target-elements).

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

`t.clearUpload` allows you to clear the list of files added with the [t.setFilesToUpload](setfilestoupload.md) method.

## Select Target Elements

{% include actions/selector-parameter.md %}
