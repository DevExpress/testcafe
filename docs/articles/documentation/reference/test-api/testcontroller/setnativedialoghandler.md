---
layout: docs
title: t.setNativeDialogueHandler Method
permalink: /documentation/reference/test-api/testcontroller/setnativedialoghandler.html
---
# t.setNativeDialogueHandler Method

To handle native dialogs invoked during the test run, specify a handler function
using the `setNativeDialogHandler` method of the
[test controller](README.md).

```text
t.setNativeDialogHandler( fn(type, text, url) [, options] )
```

Parameter  | Type                           | Description
---------- | ------------------------------ | -------------
`fn`       | Function &#124; ClientFunction | A regular or [client function](../../../guides/basic-guides/obtain-client-side-info.md) that will be triggered whenever a native dialog is invoked. `null` to remove the native dialog handler.
`options`&#160;*(optional)*  | Object                         | See [Client Function Options]../clientfunction/constructor.md#options).

The handler function has the following arguments.

Argument | Type   | Description
-------- | ------ | -------------
`type`   | String | The type of the native dialog. `'alert'` &#124; `'confirm'` &#124; `'beforeunload'` &#124; `'prompt'`.
`text`   | String | Text of the dialog message.
`url`    | String | The URL of the page that invoked the dialog. Use it to determine if the dialog originated from the main window or an `<iframe>`.

Once the handler is specified, it will be triggered each time a native dialog appears in the test whether it originates from the main window or an `<iframe>`.
You can provide a new handler at any moment by calling `t.setNativeDialogHandler` once again.
If a native dialog appears when no handler is set, the test fails with an error.

You can remove a dialog handler by passing `null` to the `t.setNativeDialogHandler` method.

To handle native dialogs that appear during the page load, specify the dialog handler
before the first test action.

> The handler is executed on the client side, so you cannot use Node.js API in the handler.

You can control how a dialog is handled by using the handler's return values.
If you return nothing, TestCafe performs default handling.

The kind of the value that should be returned depends on the dialog type. See the table below for reference.

Dialog Type  | Return Value                                             | Default Handling
------------ | -------------------------------------------------------- | --------------
alert        | Ignored                                                  | 'OK' button.
beforeunload | Ignored                                                  | 'Leave' button. There is no way to emulate 'Stay' programmatically.
confirm      | `true` to answer 'OK'; `false` to answer 'Cancel'.       | 'Cancel' button.
prompt       | A string that contains text to be typed into the prompt. | 'Cancel' button.

The following example demonstrates how to handle an alert dialog.

```js
fixture `My fixture`
    .page `http://www.example.com/`;

test('My test', async t => {
    await t
        .setNativeDialogHandler(() => true)
        .click('#show-alert-button');
});
```

The next example is a test that handles two confirm dialogs and a prompt dialog.

```js
fixture `My fixture`
    .page `http://www.example.com/`;

test('My test', async t => {
    await t
        .setNativeDialogHandler((type, text, url) => {
            switch (type) {
                case 'confirm':
                    switch (text) {
                        case 'Do you want to subscribe?':
                            return false;
                        case 'Do you want to delete your account?':
                            return true;
                        default:
                            throw 'Unexpected confirm dialog!';
                    }
                case 'prompt':
                    return 'Hi there';
                case 'alert':
                    throw 'An alert was invoked!';
            }
        })
        .click('#confirm-subscription');
        .click('#show-prompt');
        .click('#confirm-account-deletion');
});
```

You can get the native dialog history with the [t.getNativeDialogHistory](getnativedialoghistory.md) method.
