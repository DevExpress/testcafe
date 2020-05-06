---
layout: docs
title: t.getNativeDialogHistory Method
permalink: /documentation/reference/test-api/testcontroller/getnativedialoghistory.html
---
# t.getNativeDialogHistory Method

Provides a history of the invoked native dialogs.

```text
t.getNativeDialogHistory() → Promise<[{type, text, url}]>
```

`t.getNativeDialogHistory` returns a stack of history entries (that is, an array in which the latest dialog has an index of `0`).
Each entry corresponds to a native dialog that appears in the main window or in an `<iframe>`.

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

You can set the native dialog handler with the [t.setNativeDialogHandler](setnativedialoghandler.md) method.
