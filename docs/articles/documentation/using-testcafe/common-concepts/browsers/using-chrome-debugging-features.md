---
layout: docs
title: Using Chrome Debugging Features
permalink: /documentation/using-testcafe/common-concepts/browsers/using-chrome-debugging-features.html
---
# Using Chrome Debugging Features

Using the [Chrome Debugging Protocol (CDP)](https://chromedevtools.github.io/devtools-protocol/), TestCafe provides the following Chrome-specific features:

* [Running Tests in Headless Mode](#running-tests-in-headless-mode)
* [Running Tests in the Device Emulation Mode](#running-tests-in-the-device-emulation-mode)

CDP requires a remote debugging port to attach to a Chrome instance. TestCafe automatically assigns a free port but you can specify a custom port via the `cdpPort` argument if necessary:

```sh
testcafe "chrome:headless:cdpPort=9223" tests/sample-fixture.js
```

```js
runner
    .src('tests/sample-fixture.js')
    .browsers('chrome:headless:cdpPort=9223')
    .run();
```

## Running Tests in Headless Mode

TestCafe allows you to run tests in Google Chrome without any visible UI shell - in the [headless mode](https://developers.google.com/web/updates/2017/04/headless-chrome). Note that the [Take screenshot](../../test-api/actions/take-screenshot.md) and [Resize window](../../test-api/actions/resize-window.md) features are fully supported in headless mode.

```sh
testcafe "chrome:headless" tests/sample-fixture.js
```

```js
runner
    .src('tests/sample-fixture.js')
    .browsers('chrome:headless')
    .run();
```

Specify a path to installation location, if you install a portable version of Chrome:

```sh
testcafe "chrome:path/to/chrome:headless" tests/sample-fixture.js
```

```js
runner
    .src('tests/sample-fixture.js')
    .browsers('chrome:path/to/chrome:headless')
    .run();
```

> In headless mode the browser's viewport size is `1280x800` by default. You can change it via the [ResizeWindow](../../test-api/actions/resize-window.md) command or via [Device Emulation Mode](#running-tests-in-the-device-emulation-mode) parameters.

## Running Tests in the Device Emulation Mode

You can run test in Chrome's built-in [device emulator](https://developers.google.com/web/tools/chrome-devtools/device-mode/).

Use the `device` parameter to specify the target device.

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

## Available Options

Usage:

```sh
chrome[:<path-to-browser>][:headless][:emulation][:<cdp-arguments>][ --<cmd-arguments>]
```

Parameter                       | Description
------------------------------- |  -----------------------
`path-to-browser` *(optional)*  | A path to a portable browser. The path to browser is not required, if it is installed in a system.
`headless` *(optional)*         | Enables [headless mode](https://developers.google.com/web/updates/2017/04/headless-chrome).
`emulation` *(optional)*        | Enables Chrome [device emulator](https://developers.google.com/web/tools/chrome-devtools/device-mode/).
`cdp-arguments` *(optional)*    | Emulated device and CDP options separated by `;`.
`cmd-arguments` *(optional)*    | Command line [arguments](../command-line-interface.md#starting-browser-with-arguments) that are passed to the Chrome.

The following `cdp-arguments` are available:

Parameter                      | Type   | Description             | Default
------------------------------ | ------ | ----------------------- | -------
`device` *(optional)*       | String  | The emulated device name (see the full list of supported devices in DevTools -> ⠇->Settings -> Devices). | No default value.
`width` *(optional)*        | Number  | The device screen width in pixels. | The chosen device's width. If the `device` parameter is not set, the default browser's width.
`height` *(optional)*       | Number  | The device screen height in pixels. | The chosen device's height. If the `device` parameter is not set, the default browser's height.
`scaleFactor` *(optional)*  | Number  | Device scale factor value. | Depends on a chosen `device` or your system parameters.
`mobile` *(optional)*       | Boolean | Whether to emulate a mobile device. This includes the viewport meta tag, overlay scrollbars, text autosizing and more. | `true` if a mobile device is set via the `device` property. Otherwise `false`.
`orientation` *(optional)*  | `vertical` &#124; `horizontal` | The device orientation | `vertical`
`userAgent` *(optional)*    | String  | The user agent string | The user agent string of the selected `device` or the browser.
`touch` *(optional)*        | Boolean | Enables or disables the touch event emulation. | `true` if a touch-supported device is set via the `device` property or your system supports touch events. Otherwise `false`.
`cdpPort` *(optional)*      | Number  | A port (0-65535) used for the Chrome Debugging Protocol. | If not specified TestCafe automatically assigns a free port.
