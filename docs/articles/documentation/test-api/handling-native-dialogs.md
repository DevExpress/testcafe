---
layout: docs
title: Handling Native Dialogs
permalink: /documentation/test-api/handling-native-dialogs.html
checked: true
---
# Handling Native Dialogs

TestCafe allows you to handle native browser dialogs whenever they are invoked during the test run.
You can close [alert](https://developer.mozilla.org/en-US/docs/Web/API/Window/alert) and
[beforeunload](https://developer.mozilla.org/en-US/docs/Web/Events/beforeunload) dialogs,
choose either option in [confirm](https://developer.mozilla.org/en-US/docs/Web/API/Window/confirm) dialogs
or provide text to type into [prompt](https://developer.mozilla.org/en-US/docs/Web/API/Window/prompt) dialogs.

You can also access the history of the invoked native dialogs, so that you can determine if a certain dialog appeared or not.

This topic contains the following sections.

* [Dialog Handler](#dialog-handler)
* [Dialog History](#dialog-history)

## Dialog Handler

To handle native dialogs invoked during the test run, specify a handler function
using the `setNativeDialogHandler` method of the
[test controller](test-code-structure.md#test-controller).

```text
t.setNativeDialogHandler( fn(type, text, url) [, options] )
```

Parameter  | Type                           | Description
---------- | ------------------------------ | -------------
`fn`       | Function &#124; ClientFunction | A regular or [client function](obtaining-data-from-the-client/README.md) that will be triggered whenever a native dialog is invoked. `null` to remove the native dialog handler.
`options`&#160;*(optional)*  | Object                         | See [Client Function Options](obtaining-data-from-the-client/README.md#options).

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
confirm      | `true` to answer 'Yes'; `false` to answer 'No'.          | 'No' button.
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

## Dialog History

You can get the history of the invoked native dialogs to check if a certain dialog appeared or not.

Use the [test controller's](test-code-structure.md#test-controller) `getNativeDialogHistory` method for this.

```text
t.getNativeDialogHistory() → Promise<[{type, text, url}]>
```

`t.getNativeDialogHistory` returns a stack of history entries (i.e., an array in which the latest dialog has an index of `0`).
Each entry corresponds to a certain native dialog that appears in the main window or in an `<iframe>`.

A history entry contains the following properties.

Property | Type   | Description
-------- | ------ | -------------
`type`   | String | The type of the native dialog. `'alert'` &#124; `'confirm'` &#124; `'beforeunload'` &#124; `'prompt'`.
`text`   | String | Text of the dialog message.
`url`    | String | The URL of the page that invoked the dialog. Use it to determine if the dialog originated from the main window or an `<iframe>`.

```js
fixture `My fixture`
    .page `http://www.example.com/`;

test('My test', async t => {
    await t
        .setNativeDialogHandler((type, text, url) => {
            if (type === 'confirm')
                return true;
            else if (type === 'prompt')
                return 'Hello!';
        })
        .click('#show-alert')
        .click('#show-confirm')
        .click('#show-prompt');

    const history = await t.getNativeDialogHistory();

    await t
        .expect(history[0].type).eql('prompt')
        .expect(history[0].text).eql('say hello')
        .expect(history[1].type).eql('confirm')
        .expect(history[2].type).eql('alert');
});
```
