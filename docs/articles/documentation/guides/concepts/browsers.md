---
layout: docs
title: Browsers
permalink: /documentation/guides/concepts/browsers.html
redirect_from:
  - /documentation/using-testcafe/common-concepts/
  - /documentation/using-testcafe/common-concepts/browsers/
  - /documentation/using-testcafe/common-concepts/browsers/browser-support.html
  - /documentation/using-testcafe/common-concepts/browsers/testing-in-headless-mode.html
  - /documentation/using-testcafe/common-concepts/browsers/user-profiles.html
  - /documentation/using-testcafe/common-concepts/browsers/using-chrome-device-emulation.html
  - /documentation/using-testcafe/common-concepts/browsers/using-chromium-device-emulation.html
---
# Browsers

This topic lists browsers supported by TestCafe and describes how to use various browser features.

* [Browser Support](#browser-support)
  * [Officially Supported Browsers](#officially-supported-browsers)
  * [Locally Installed Browsers](#locally-installed-browsers)
  * [Portable Browsers](#portable-browsers)
  * [Browsers on Remote Devices](#browsers-on-remote-devices)
  * [Browsers in Cloud Testing Services](#browsers-in-cloud-testing-services)
  * [Microsoft Edge Legacy Support](#microsoft-edge-legacy-support)
  * [Nonconventional Browsers](#nonconventional-browsers)
* [Test in Headless Mode](#test-in-headless-mode)
  * [Automation Port](#automation-port)
* [Use Chromium Device Emulation](#use-chromium-device-emulation)
  * [Emulate a Device](#emulate-a-device)
  * [Emulate Screen Size](#emulate-screen-size)
  * [Use Emulation in Headless Mode](#use-emulation-in-headless-mode)
  * [Use Emulation in Chrome Portable](#use-emulation-in-chrome-portable)
  * [Substitute a User Agent](#substitute-a-user-agent)
  * [Emulator Parameters](#emulator-parameters)
* [User Profiles](#user-profiles)

## Browser Support

### Officially Supported Browsers

While TestCafe is designed to support most modern browsers, there are a limited number
of *officially supported* browsers. TestCafe is actively tested with these browsers.

* Google Chrome: Stable, Beta, Dev and Canary
* Internet Explorer (11+)
* Microsoft Edge (legacy and Chromium-based)
* Mozilla Firefox
* Safari
* Google Chrome mobile
* Safari mobile

> TestCafe supports the latest version of each browser (unless specified explicitly).

### Locally Installed Browsers

TestCafe automatically detects popular browsers installed on a local computer.
You can use a short name - the *browser alias* - to identify browsers when you launch a test.

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

Call the `testcafe` command with the [--list-browsers](../../reference/command-line-interface.md#-b---list-browsers) flag to view a list of all available browsers.

To run tests in a different local browser, specify the path to the browser's executable file.

> To test in Microsoft Edge Chromium and Legacy on the same machine, [install them side-by-side](https://docs.microsoft.com/en-us/DeployEdge/microsoft-edge-sysupdate-access-old-edge). Once installed, see the [Microsoft Edge Legacy Support](#microsoft-edge-legacy-support) section below for information on how to enable testing in older versions.

For more information and examples, see the following:

* Command line: [Local Browsers](../../reference/command-line-interface.md#local-browsers)
* API: [runner.browsers](../../reference/testcafe-api/runner/browsers.md)
* Configuration file: [browsers](../../reference/configuration-file.md#browsers)

### Portable Browsers

To use a portable browser, specify the path to the browser's executable file. For more information and examples, see the following:

* Command line: [Portable Browsers](../../reference/command-line-interface.md#portable-browsers)
* API: [runner.browsers](../../reference/testcafe-api/runner/browsers.md)
* Configuration file: [browsers](../../reference/configuration-file.md#browsers)

### Browsers on Remote Devices

To run tests on a remote mobile and desktop device, the device must have network access to the TestCafe server.

First, you will need to create a remote browser connection.

* Command line: specify the `remote` *alias* (see [Remote Browsers](../../reference/command-line-interface.md#remote-browsers))
* API: use the [createBrowserConnection](../../reference/testcafe-api/testcafe/createbrowserconnection.md) method
* Configuration file: [browsers](../../reference/configuration-file.md#browsers)

After that, TestCafe generates a URL to open in the browser that you need to test (on a remote device). This URL is then exposed through the API or displayed in the console. Access this URL from the desired browser. It then connects to the TestCafe server and starts the test.

> Note that when you run tests in a remote browser, you cannot [take screenshots](../basic-guides/interact-with-the-page.md#take-screenshot) or [resize the browser window](../basic-guides/interact-with-the-page.md#resize-window).

### Browsers in Cloud Testing Services

TestCafe allows you to use browsers from cloud testing services. You can access them through [browser provider plugins](../extend-testcafe/browser-provider-plugin.md).

The following plugins for cloud services are currently provided by the TestCafe team.

Service                              | Plugin
------------------------------------ | -------------------
[Sauce Labs](https://saucelabs.com/)          | [testcafe-browser-provider-saucelabs](https://www.npmjs.com/package/testcafe-browser-provider-saucelabs)
[BrowserStack](https://www.browserstack.com/) | [testcafe-browser-provider-browserstack](https://www.npmjs.com/package/testcafe-browser-provider-browserstack)

You can search npm for community-developed plugins. Their names begin with the `testcafe-browser-provider-` prefix: [https://www.npmjs.com/search?q=testcafe-browser-provider](https://www.npmjs.com/search?q=testcafe-browser-provider).

You can also create your own plugin. See [Browser Provider Plugin](../extend-testcafe/browser-provider-plugin.md) for instructions.

### Microsoft Edge Legacy Support

Tests are run in Microsoft Edge Legacy if it is the only version of Edge installed on the machine.

If both Chromium-based and Legacy versions are available, you can change the default Edge application in **System Settings** to test with the Legacy version.

To test with the Legacy version of Edge, open **Default apps** in **Windows Settings** and scroll down to select **Default Apps by Protocol**. Set the `MICROSOFT-EDGE:` protocol to Legacy Edge.

### Nonconventional Browsers

To run tests in a different type of browser, use a [browser provider plugin](../extend-testcafe/browser-provider-plugin.md).

You can search npm for community-developed plugins. Their names begin with the `testcafe-browser-provider-` prefix: [https://www.npmjs.com/search?q=testcafe-browser-provider](https://www.npmjs.com/search?q=testcafe-browser-provider).

You can also create your own plugin. See [Browser Provider Plugin](../extend-testcafe/browser-provider-plugin.md) for instructions.

## Test in Headless Mode

TestCafe allows you to run tests in Google Chrome and Mozilla Firefox without a visible UI shell - in *headless mode* ([Chrome Headless](https://developers.google.com/web/updates/2017/04/headless-chrome), [Firefox Headless](https://developer.mozilla.org/en-US/Firefox/Headless_mode)). Use the `:headless` parameter to launch a browser in headless mode.

```sh
testcafe "chrome:headless" tests/sample-fixture.js
```

```js
runner
    .src('tests/sample-fixture.js')
    .browsers('chrome:headless')
    .run();
```

Specify a path to the browser executable if you use a portable version of the browser. Use the [browser alias](#locally-installed-browsers) instead of the `path:` prefix.

```sh
testcafe "firefox:path/to/firefox:headless" tests/sample-fixture.js
```

```js
runner
    .src('tests/sample-fixture.js')
    .browsers('firefox:path/to/firefox:headless')
    .run();
```

Note that [Take screenshot](../basic-guides/interact-with-the-page.md#take-screenshot) and [Resize window](../basic-guides/interact-with-the-page.md#resize-window) are fully supported in headless mode.

### Automation Port

Chrome and Firefox require a remote control port for TestCafe to attach to a browser instance. TestCafe automatically assigns a free port, but you can specify a custom port via the `cdpPort` argument (for Chrome) or the `marionettePort` argument (for Firefox).

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

You can run tests with Chromium's built-in [device emulator](https://developers.google.com/web/tools/chrome-devtools/device-mode/) in Google Chrome, Chromium and Chromium-based Microsoft Edge. Use the `emulation` browser parameter.

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

### Emulate Screen Size

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

You can combine device emulation and headless mode.

```sh
testcafe "chrome:headless:emulation:device=iphone X;cdpPort=9223" tests/sample-fixture.js
```

```js
runner
    .src('tests/sample-fixture.js')
    .browsers('chrome:headless:emulation:device=iphone X;cdpPort=9223')
    .run();
```

### Use Emulation in Chrome Portable

To enable device emulation in Google Chrome Portable, use the [browser alias](#locally-installed-browsers). The `path:` prefix does not work in this case.

```sh
testcafe "chrome:d:\chrome_portable\chrome.exe:emulation:device=iphone X" tests/test.js
```

### Substitute a User Agent

Use the `userAgent` parameter to substitute a user agent string.

> Important! TestCafe relies on a user agent string to emulate browser behavior. Tests are not guaranteed to run correctly if you specify a user agent that is invalid or [not supported by TestCafe](#browser-support).

You need to escape special characters in the user agent string when you specify it in the command line. These characters include:

* `\` (backslash)
* `'` (single quote)
* `"` (double quote)
* `,` (comma)
* `;` (semicolon)
* `:` (colon)

The way to escape special characters depends on the shell you use. You also need to escape semicolons from the TestCafe argument parser with an additional backslash.

The following examples show how to escape user agent screens in `bash` and `PowerShell`.

**bash**

In `bash`, enter a dollar sign before the argument to allow single quotes. Escape special characters with a backslash and use a double backslash for semicolons - to escape them from the TestCafe argument parser:

```sh
testcafe $'chrome:emulation:userAgent=\'Mozilla/5.0 (Windows NT 10.0\\; Win64\\; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36\'' test.js
```

**PowerShell**

In `PowerShell`, escape special characters with a single quote and use a backslash for semicolons - to escape them from the TestCafe argument parser:

```sh
testcafe 'chrome:emulation:userAgent=''Mozilla/5.0 (Windows NT 10.0\; Win64\; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36''' test.js
```

### Emulator Parameters

Use the following parameters to configure the Chrome device emulator. Specify them after the `emulation` parameter as in the examples above.

Parameter                      | Type   | Description             | Default
------------------------------ | ------ | ----------------------- | -------
`device` *(optional)*       | String  | The emulated device name (see the full list of supported devices in DevTools -> ⠇-> Settings -> Devices). | No default value.
`width` *(optional)*        | Number  | The device screen width in pixels. | The width of the selected device. If the `device` parameter is not set, the default browser width is used.
`height` *(optional)*       | Number  | The device's screen height in pixels. | The height of the selected device. If the `device` parameter is not set, the default browser height is used.
`scaleFactor` *(optional)*  | Number  | Device scale factor value. | Depends on the selected `device` or your system parameters.
`mobile` *(optional)*       | Boolean | Defines whether to emulate a mobile device. This includes the viewport meta tag, overlay scrollbars, text autosizing, etc. | `true` if a mobile device is set via the `device` property. Otherwise, `false`.
`orientation` *(optional)*  | `vertical` &#124; `horizontal` | The device orientation | `vertical`
`userAgent` *(optional)*    | String  | The user agent string | The user agent string of the selected `device` or the browser.
`touch` *(optional)*        | Boolean | Enables or disables touch event emulation. | `true` if a touch-supported device is set via the `device` property or your system supports touch events. Otherwise, `false`.
`cdpPort` *(optional)*      | Number  | A port (0-65535) used for Chrome Debugging Protocol. | `9222` if you load a user profile with the [:userProfile](#user-profiles) or `--user-data-dir` flag. Otherwise, TestCafe automatically assigns a free port.

## User Profiles

By default, TestCafe launches Google Chrome and Mozilla Firefox with a clean profile (i.e. without extensions, bookmarks and other profile settings) - to minimize profile parameter influence on test runs.

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
