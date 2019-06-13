---
layout: docs
title: Using Chrome Device Emulation
permalink: /documentation/using-testcafe/common-concepts/browsers/using-chrome-device-emulation.html
---
# Using Chrome Device Emulation

You can run test in Chrome's built-in [device emulator](https://developers.google.com/web/tools/chrome-devtools/device-mode/). To do this, use the `emulation` browser parameter.

## Emulate a Device

Specify the target device with the `device` parameter.

```sh
testcafe "chrome:emulation:device=iphone X" tests/sample-fixture.js
```

```js
runner
    .src('tests/sample-fixture.js')
    .browsers('chrome:emulation:device=iphone X')
    .run();
```

## Emulate a Screen Size

You can configure the device emulator by providing `width`, `height`, `orientation`, etc.

```sh
testcafe "chrome:emulation:width=100;height=200;mobile=true;orientation=vertical;touch=true" tests/sample-fixture.js
```

```js
runner
    .src('tests/sample-fixture.js')
    .browsers('chrome:emulation:width=100;height=200;mobile=true;orientation=vertical;touch=true')
    .run();
```

## Use Emulation in Headless Mode

You can combine both device emulation and headless mode.

```sh
testcafe "chrome:headless:emulation:device=iphone X;cdpPort=9223" tests/sample-fixture.js
```

```js
runner
    .src('tests/sample-fixture.js')
    .browsers('chrome:headless:emulation:device=iphone X;cdpPort=9223')
    .run();
```

## Use Emulation in Portable Chrome

To enable device emulation in a portable Chrome, use the [browser alias](browser-support.md#locally-installed-browsers). The `path:` prefix does not work in this case.

```sh
testcafe "chrome:d:\chrome_portable\chrome.exe:emulation:device=iphone X" tests/test.js
```

## Substitute a User Agent

Use the `userAgent` parameter to substitute a user agent string.

> Important! TestCafe relies on the user agent string to emulate the browser behavior. Tests are not guaranteed to run correctly if you provide a user agent that is invalid or [not supported by TestCafe](browser-support.md).

You need to escape special characters in the user agent string when you specify it in the command line. These characters include:

* `\` (backslash)
* `'` (single quote)
* `"` (double quote)
* `,` (comma)
* `;` (semicolon)
* `:` (colon)

The way to escape special characters depends on the shell you use. You also need to escape semicolons from the TestCafe argument parser with an additional backslash.

The following examples show user agent strings escaped for `bash` and `PowerShell`.

**bash**

In `bash`, put a dollar sign before the argument to allow single quotes. Escape special characters with a backslash and use a double backslash for semicolons to escape them from the TestCafe argument parser:

```sh
testcafe $'chrome:emulation:userAgent=\'Mozilla/5.0 (Windows NT 10.0\\; Win64\\; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36\'' test.js
```

**PowerShell**

In `PowerShell`, escape special characters with a single quote and use a backslash for semicolons to escape them from the TestCafe argument parser:

```sh
testcafe 'chrome:emulation:userAgent=''Mozilla/5.0 (Windows NT 10.0\; Win64\; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36''' test.js
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
