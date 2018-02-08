---
layout: docs
title: Resize Window
permalink: /documentation/test-api/actions/resize-window.html
checked: true
---
# Resize Window

There are three ways of resizing a browser window.

**Note**: these actions require a [ICCCM/EWMH-compliant window manager](https://en.wikipedia.org/wiki/Comparison_of_X_window_managers) on Linux.

* [Setting the Window Size](#setting-the-window-size)
* [Fitting the Window into a Particular Device](#fitting-the-window-into-a-particular-device)
* [Maximizing the Window](#maximizing-the-window)

## Setting the Window Size

```text
t.resizeWindow( width, height )
```

Parameter  | Type    | Description
---------- | ------- | --------------------------
`width`    | Number  | The new width, in pixels.
`height`   | Number  | The new height, in pixels.

The following example demonstrates how to use the `t.resizeWindow` action.

```js
import { Selector } from 'testcafe';

const menu = Selector('#side-menu');

fixture `My fixture`
    .page `http://www.example.com/`;

test('Side menu disappears on small screens', async t => {
    await t
        .resizeWindow(200, 100)
        .expect(menu.getStyleProperty('display')).eql('none');
});
```

## Fitting the Window into a Particular Device

```text
t.resizeWindowToFitDevice( deviceName [, options] )
```

Resizes the window so that it fits on the screen of the specified mobile device.

Parameter              | Type   | Description
---------------------- | ------ | -------------------------------------------------------------------------------------------
`deviceName`           | String | The name of the device as listed at [http://viewportsizes.com/](http://viewportsizes.com/).
`options`&#160;*(optional)* | Object | Provide additional information about the device.

The `options` object can contain the following properties.

Property              | Type    | Description
--------------------- | ------- | --------------------------------------------------------------
`portraitOrientation` | Boolean | `true` for portrait screen orientation; `false` for landscape.

The example below shows how to use the `t.resizeWindowToFitDevice` action.

```js
import { Selector } from 'testcafe';

const header = Selector('#header');

fixture `My fixture`
    .page `http://www.example.com/`;

test('Header is displayed on Xperia Z in portrait', async t => {
    await t
        .resizeWindowToFitDevice('Sony Xperia Z', {
            portraitOrientation: true
        })
        .expect(header.getStyleProperty('display')).notEql('none');
});
```

## Maximizing the Window

```text
t.maximizeWindow( )
```

Maximizes the browser window.

The following example shows how to use this action.

```js
import { Selector } from 'testcafe';

const menu = Selector('#side-menu');

fixture `My fixture`
    .page `http://www.example.com/`;

test('Side menu is displayed in full screen', async t => {
    await t
        .maximizeWindow()
        .expect(menu.visible).ok();
});
```
