---
layout: docs
title: Resize Window
permalink: /documentation/test-api/actions/resize-window.html
---
# Resize Window

There are two ways to resize the browser window.

* [Setting the Window Size](#setting-the-window-size)
* [Fitting the Window into a Particular Device](#fitting-the-window-into-a-particular-device)

> Important! These actions are not yet available on Linux.
> See the corresponding [issue on Github](https://github.com/DevExpress/testcafe-browser-natives/issues/12).

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
import { expect } from 'chai';

fixture `My fixture`
    .page('http://www.example.com/');

test('Side menu disappears on small screens', async t => {
    await t.resizeWindow(200, 100);

    const menu = await t.select('#side-menu');

    expect(menu.style.display).to.equal('none');
});
```

## Fitting the Window into a Particular Device

```text
t.resizeWindowToFitDevice( deviceName [, options] )
```

Resizes the window so that it fits into the screen of a certain mobile device.

Parameter              | Type   | Description
---------------------- | ------ | -------------------------------------------------------------------------------------------
`deviceName`           | String | The name of the device as listed at [http://viewportsizes.com/](http://viewportsizes.com/).
`options` *(optional)* | Object | Provide additional information about the device.

The `options` object can contain the following properties.

Property              | Type    | Description
--------------------- | ------- | --------------------------------------------------------------
`portraitOrientation` | Boolean | `true` for portrait screen orientation; `false` for landscape.

The example below shows how to use the `t.resizeWindowToFitDevice` action.

```js
import { expect } from 'chai';

fixture `My fixture`
    .page('http://www.example.com/');

test('Header is displayed on Xperia Z in portrait', async t => {
    await t.resizeWindowToFitDevice('Sony Xperia Z', {
        portraitOrientation: true
    });

    const header = await t.select('#header');

    expect(header.style.display).to.not.equal('none');
});
```
