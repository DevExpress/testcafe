---
layout: docs
title: t.setNativeDialogHandler Method
permalink: /documentation/reference/test-api/testcontroller/setnativedialoghandler.html
---
# t.setNativeDialogHandler Method

To handle native dialogs invoked during the test run, specify a handler function
with the `setNativeDialogHandler` method of the
[test controller](README.md).

```text
t.setNativeDialogHandler( fn(type, text, url) [, options] )
```

Parameter  | Type                           | Description
---------- | ------------------------------ | -------------
`fn`       | Function &#124; ClientFunction | A regular or [client function](../../../guides/basic-guides/obtain-client-side-info.md) that will be triggered whenever a native dialog is invoked. `null` to remove the native dialog handler.
`options`&#160;*(optional)*  | Object                         | See [Client Function Options](../clientfunction/constructor.md#options).

The handler function has the following arguments.

Argument | Type   | Description
-------- | ------ | -------------
`type`   | String | The type of the native dialog. `'alert'` &#124; `'confirm'` &#124; `'beforeunload'` &#124; `'prompt'`.
`text`   | String | Text of the dialog message.
`url`    | String | The URL of the page that invoked the dialog. Use it to determine if the dialog originated from the main window or an `<iframe>`.

Once specified, the handler fires each time a native dialog appears in the test. The dialog can originate from the main window or an `<iframe>`.
You can call `t.setNativeDialogHandler` again to specify a new handler at any time.
If a native dialog appears when no handler is set, the test fails with an error.

To remove a dialog handler, pass `null` to the `t.setNativeDialogHandler` method.

If a dialog appears on page load, start the test from a different page, add a handler and proceed to the page with the [navigateTo](./navigateto.md) action, as shown in the the following example: [Handle a Dialog Invoked on Page Load](#handle-a-dialog-invoked-on-page-load).

> The handler is executed on the client side, so you cannot use the Node.js API in the handler.

You can use the handler's return values to control how the dialog is handled.
If you return nothing, TestCafe performs default handling.

The kind of the value that should be returned depends on the dialog type. See the table below for reference.

Dialog Type  | Return Value                                             | Default Handling
------------ | -------------------------------------------------------- | --------------
alert        | Ignored                                                  | 'OK' button.
beforeunload | Ignored                                                  | 'Leave' button. There is no way to emulate 'Stay' programmatically.
confirm      | `true` to answer 'OK'; `false` to answer 'Cancel'.       | 'Cancel' button.
prompt       | A string that contains text to be typed into the prompt. | 'Cancel' button.

You can get the native dialog history with the [t.getNativeDialogHistory](getnativedialoghistory.md) method.

## Examples

### Handle an Alert Dialog

```js
fixture `My fixture`
    .page `http://www.example.com/`;

test('My test', async t => {
    await t
        .setNativeDialogHandler(() => true)
        .click('#show-alert-button');
});
```

### Handle a Dialog Invoked on Page Load

When the page in this example loads, it displays an alert dialog. To set a handler for this alert, you can start the test from an `about:blank` page, add a handler and proceed to the page with the `navigateTo` action.

> Important! Use absolute file paths to navigate from an `about:blank` page.

```html
<body>
    <button id='btn'>Click me</button>
    <script>
        alert()
    </script>
</body>
```

```js
fixture `Select page elements`
    .page `about:blank`;

test('Handle an alert', async t => {

    await t
        .setNativeDialogHandler(() => true)
        .navigateTo('http://127.0.0.1:5500/index3.html')
        .click('#btn')
});
```

### Handle Multiple Dialogs

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

### Use a Variable in the Dialog Handler

This example shows a `delete` method in a [page model](../../../guides/concepts/page-model.md). The dialog handler types the removed item's name (`this.name`) into a prompt dialog to confirm deletion. The `name` variable is passed to the handler through [options.dependencies](../clientfunction/constructor.md#optionsdependencies).

```js
class Page {
    constructor () {
        /* ... */
        this.name = Selector('.item-name').textContent;
    }
    async delete () {
        const name = await this.name;
        await t
            .setNativeDialogHandler(() => name, { dependencies: { name }})
            .click(this.deleteBtn);
    }
}
```
