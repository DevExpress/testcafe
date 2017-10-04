---
layout: docs
title: Using Chrome Device Emulation
permalink: /documentation/using-testcafe/common-concepts/browsers/using-chrome-device-emulation.html
---
# Using Chrome Device Emulation

You can run test in Chrome's built-in [device emulator](https://developers.google.com/web/tools/chrome-devtools/device-mode/). To do this, use the `emulation` browser parameter. Specify the target device with the `device` parameter.

```sh
testcafe "chrome:emulation:device=iphone 6" tests/sample-fixture.js
```

```js
runner
    .src('tests/sample-fixture.js')
    .browsers('chrome:emulation:device=iphone 6')
    .run();
```

Alternatively, you can configure the device emulator by providing `width`, `height`, `orientation`, etc.

```sh
testcafe "chrome:emulation:width=100;height=200;mobile=true;orientation=vertical;touch=true" tests/sample-fixture.js
```

```js
runner
    .src('tests/sample-fixture.js')
    .browsers('chrome:emulation:width=100;height=200;mobile=true;orientation=vertical;touch=true')
    .run();
```

You can combine both device emulation and headless mode.

```sh
testcafe "chrome:headless:emulation:device=iphone 6;cdpPort=9223" tests/sample-fixture.js
```

```js
runner
    .src('tests/sample-fixture.js')
    .browsers('chrome:headless:emulation:device=iphone 6;cdpPort=9223')
    .run();
```

## Emulator Parameters

Use the following parameters to configure Chrome device emulator. Specify them after the `emulation` parameter as in the examples above.

Parameter                      | Type   | Description             | Default
------------------------------ | ------ | ----------------------- | -------
`device` *(optional)*       | String  | The emulated device name (see the full list of supported devices in DevTools -> ⠇-> Settings -> Devices). | No default value.
`width` *(optional)*        | Number  | The device screen width in pixels. | The chosen device's width. If the `device` parameter is not set, the default browser's width.
`height` *(optional)*       | Number  | The device screen height in pixels. | The chosen device's height. If the `device` parameter is not set, the default browser's height.
`scaleFactor` *(optional)*  | Number  | Device scale factor value. | Depends on a chosen `device` or your system parameters.
`mobile` *(optional)*       | Boolean | Whether to emulate a mobile device. This includes the viewport meta tag, overlay scrollbars, text autosizing and more. | `true` if a mobile device is set via the `device` property. Otherwise `false`.
`orientation` *(optional)*  | `vertical` &#124; `horizontal` | The device orientation | `vertical`
`userAgent` *(optional)*    | String  | The user agent string | The user agent string of the selected `device` or the browser.
`touch` *(optional)*        | Boolean | Enables or disables the touch event emulation. | `true` if a touch-supported device is set via the `device` property or your system supports touch events. Otherwise `false`.
`cdpPort` *(optional)*      | Number  | A port (0-65535) used for the Chrome Debugging Protocol. | If not specified TestCafe automatically assigns a free port.
