---
layout: docs
title: Browsers
permalink: /documentation/concepts/browsers.html
---
# Browsers

This topic lists browsers supported by TestCafe and describes how to use various browser features.

* [Browser Support](#browser-support)
* [Test in Headless Mode](#test-in-headless-mode)
* [Use Chromium Device Emulation](#use-chromium-device-emulation)
* [User Profiles](#user-profiles)

## Browser Support

### Officially Supported Browsers

While TestCafe is designed to support most modern browsers, there are a limited number
of *officially supported* browsers against which TestCafe is actively tested.

* Google Chrome: Stable, Beta, Dev and Canary
* Internet Explorer (11+)
* Microsoft Edge (legacy and Chromium-based)
* Mozilla Firefox
* Safari
* Google Chrome mobile
* Safari mobile

> TestCafe supports the latest version of each browser unless specified explicitly.

### Locally Installed Browsers

TestCafe can automatically detect popular browsers installed on the local computer.
You can use a short name - *browser alias* - to identify these browsers when you launch tests.

The following table lists browsers that can be detected automatically.

Browser                                    | Browser Alias
------------------------------------------ | -------------------
Chromium                                   | `chromium`
Google Chrome                              | `chrome`
Google Chrome Canary                       | `chrome-canary`
Internet Explorer                          | `ie`
Microsoft Edge (legacy and Chromium-based) | `edge`
Mozilla Firefox                            | `firefox`
Opera                                      | `opera`
Safari                                     | `safari`

Call the `testcafe` command with the [--list-browsers](../reference/command-line-interface.md#-b---list-browsers) flag to view the list of all the available browsers.

To run tests in a different local browser, specify the path to the browser executable file.

> To test in Microsoft Edge Chromium and Legacy on the same machine, [install them side-by-side](https://docs.microsoft.com/en-us/DeployEdge/microsoft-edge-sysupdate-access-old-edge). Once they are installed, see the [Microsoft Edge Legacy Support](#microsoft-edge-legacy-support) section below for information on how to enable testing in older versions.

For more information and examples, see:

* Command line: [Local Browsers](../reference/command-line-interface.md#local-browsers)
* API: [runner.browsers](../reference/api/runner/browsers.md)
* Configuration file: [browsers](../reference/configuration-file.md#browsers)

### Portable Browsers

To use a portable browser, specify the path to the browser executable file. For more information and examples, see:

* Command line: [Portable Browsers](../../command-line-interface.md#portable-browsers)
* API: [runner.browsers](../reference/api/runner/browsers.md)
* Configuration file: [browsers](../reference/configuration-file.md#browsers)

### Browsers on Remote Devices

To run tests on a remote mobile and desktop device, this device must have network access to the TestCafe server.

First, you will need to create a remote browser connection.

* Command line: specify the `remote` *alias* (see [Remote Browsers](../reference/command-line-interface.md#remote-browsers))
* API: use the [createBrowserConnection](../reference/api/testcafe/createbrowserconnection.md) method
* Configuration file: [browsers](../reference/configuration-file.md#browsers)

After that, TestCafe will provide a URL to open on the remote device in the browser against which you want to test.
As you open this URL, the browser connects to the TestCafe server and starts testing.

> You cannot [take screenshots](../guides/basic-guides/interact-with-the-page.md#take-screenshot) or [resize the browser window](../guides/basic-guides/interact-with-the-page.md#resize-window) when you run tests in remote browsers.

### Browsers in Cloud Testing Services

TestCafe allows you to use browsers from cloud testing services. You can access them through [browser provider plugins](../extending-testcafe/browser-provider-plugin/README.md).

The following plugins for cloud services are currently provided by the TestCafe team.

Service                              | Plugin
------------------------------------ | -------------------
[Sauce Labs](https://saucelabs.com/)          | [testcafe-browser-provider-saucelabs](https://www.npmjs.com/package/testcafe-browser-provider-saucelabs)
[BrowserStack](https://www.browserstack.com/) | [testcafe-browser-provider-browserstack](https://www.npmjs.com/package/testcafe-browser-provider-browserstack)

You can search npm for plugins developed by the community. Their names begin with the `testcafe-browser-provider-` prefix: [https://www.npmjs.com/search?q=testcafe-browser-provider](https://www.npmjs.com/search?q=testcafe-browser-provider).

You can also create your own plugin. See [Browser Provider Plugin](../extending-testcafe/browser-provider-plugin/README.md) for instructions.

### Microsoft Edge Legacy Support

Tests are run in Microsoft Edge Legacy if it is the only version of Edge installed on the machine.

If Chromium-based and Legacy versions are available, you can change the default Edge application in **System Settings** to test in the Legacy version.

To do this, open **Default apps** in **Windows Settings** and scroll down to select the option **Default Apps by Protocol**. Set the `MICROSOFT-EDGE:` protocol to Legacy Edge.

### Nonconventional Browsers

To use a different type of browser, use a [browser provider plugin](../extending-testcafe/browser-provider-plugin/README.md).

You can search npm for plugins developed by the community. Their names begin with the `testcafe-browser-provider-` prefix: [https://www.npmjs.com/search?q=testcafe-browser-provider](https://www.npmjs.com/search?q=testcafe-browser-provider).

You can also create your own plugin. See [Browser Provider Plugin](../extending-testcafe/browser-provider-plugin/README.md) for instructions.

## Test in Headless Mode

TestCafe allows you to run tests in Google Chrome and Mozilla Firefox without any visible UI shell - in the headless mode ([Chrome Headless](https://developers.google.com/web/updates/2017/04/headless-chrome), [Firefox Headless](https://developer.mozilla.org/en-US/Firefox/Headless_mode)). Use the `:headless` parameter to launch a browser in the headless mode.

```sh
testcafe "chrome:headless" tests/sample-fixture.js
```

```js
runner
    .src('tests/sample-fixture.js')
    .browsers('chrome:headless')
    .run();
```

Specify a path to the browser executable if you use a portable version of the browser. Use the [browser alias](locally-installed-browsers) instead of the `path:` prefix.

```sh
testcafe "firefox:path/to/firefox:headless" tests/sample-fixture.js
```

```js
runner
    .src('tests/sample-fixture.js')
    .browsers('firefox:path/to/firefox:headless')
    .run();
```

Note that the [Take screenshot](../guides/basic-guides/interact-with-the-page.md#take-screenshot) and [Resize window](../guides/basic-guides/interact-with-the-page.md#resize-window) features are fully supported in the headless mode.

### Automation Port

Chrome and Firefox require a remote control port for TestCafe to attach to the browser instance. TestCafe automatically assigns a free port but you can specify a custom port via the `cdpPort` argument for Chrome and the `marionettePort` argument for Firefox.

```sh
testcafe "chrome:headless:cdpPort=9223" tests/sample-fixture.js
```

```js
runner
    .src('tests/sample-fixture.js')
    .browsers('chrome:headless:cdpPort=9223')
    .run();
```

```sh
testcafe "firefox:headless:marionettePort=9223" tests/sample-fixture.js
```

```js
runner
    .src('tests/sample-fixture.js')
    .browsers('firefox:headless:marionettePort=9223')
    .run();
```

## Use Chromium Device Emulation

You can run test with Chromium's built-in [device emulator](https://developers.google.com/web/tools/chrome-devtools/device-mode/) in Google Chrome, Chromium and Chromium-based Microsoft Edge. To do this, use the `emulation` browser parameter.

### Emulate a Device

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

### Emulate a Screen Size

You can specify parameters like `width`, `height`, or `orientation` to configure the device emulator.

```sh
testcafe "chrome:emulation:width=100;height=200;mobile=true;orientation=vertical;touch=true" tests/sample-fixture.js
```

```js
runner
    .src('tests/sample-fixture.js')
    .browsers('chrome:emulation:width=100;height=200;mobile=true;orientation=vertical;touch=true')
    .run();
```

### Use Emulation in Headless Mode

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

### Use Emulation in Portable Chrome

To enable device emulation in a portable Chrome, use the [browser alias](#locally-installed-browsers). The `path:` prefix does not work in this case.

```sh
testcafe "chrome:d:\chrome_portable\chrome.exe:emulation:device=iphone X" tests/test.js
```

### Substitute a User Agent

Use the `userAgent` parameter to substitute a user agent string.

> Important! TestCafe relies on the user agent string to emulate the browser behavior. Tests are not guaranteed to run correctly if you provide a user agent that is invalid or [not supported by TestCafe](#browser-support).

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

### Emulator Parameters

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
`cdpPort` *(optional)*      | Number  | A port (0-65535) used for the Chrome Debugging Protocol. | `9222` if you load a user profile with the [:userProfile](#user-profiles) or `--user-data-dir` flag. Otherwise, TestCafe automatically assigns a free port.

## User Profiles

By default, TestCafe launches browsers (Google Chrome and Mozilla Firefox so far) with a clean profile, i.e. without extensions, bookmarks and other profile settings. This was done to minimize the influence of profile parameters on test runs.

However, if you need to start a browser with the current user profile, you can specify the `:userProfile` flag after the [browser alias](#locally-installed-browsers).

```sh
testcafe firefox:userProfile tests/test.js
```

```js
runner
    .src('tests/fixture1.js')
    .browsers('firefox:userProfile')
    .run();
```

When you pass the `:userProfile` flag to a portable browser, also use the [browser alias](#locally-installed-browsers). The `path:` prefix does not work in this case.

```sh
testcafe chrome:d:\chrome_portable\chrome.exe:userProfile tests/test.js
```
