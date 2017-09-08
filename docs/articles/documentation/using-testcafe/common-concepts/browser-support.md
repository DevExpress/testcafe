---
layout: docs
title: Browser Support
permalink: /documentation/using-testcafe/common-concepts/browser-support.html
---
# Browser Support

* [Officially Supported Browsers](#officially-supported-browsers)
* [Locally Installed Browsers](#locally-installed-browsers)
* [Portable Browsers](#portable-browsers)
* [Browsers on Remote Devices](#browsers-on-remote-devices)
* [Browsers in Cloud Testing Services](#browsers-in-cloud-testing-services)
* [Using Chrome-specific Features](#using-chrome-specific-features)
    * [Running Tests in Headless Mode](#running-tests-in-headless-mode)
    * [Running Tests in the Device Emulation Mode](#running-tests-in-the-device-emulation-mode)
    * [Available Chrome Options](#available-chrome-options)
* [Nonconventional Browsers](#nonconventional-browsers)

## Officially Supported Browsers

While TestCafe is designed to support most modern browsers, there are a limited number
of *officially supported* browsers against which TestCafe is actively tested.

* Google Chrome: Stable, Beta, Dev and Canary
* Internet Explorer (9+)
* Microsoft Edge
* Mozilla Firefox
* Safari
* Android browser (the latest available on SauceLabs)
* Safari mobile

> TestCafe supports the latest version of each browser unless specified explicitly.

## Locally Installed Browsers

TestCafe can automatically detect popular browsers installed on the local computer.
You can use a short name - *browser alias* - to identify these browsers when launching tests.

The following table lists browsers that can be detected automatically.

Browser              | Browser Alias
---------------------| -------------------
Chromium             | `chromium`
Google Chrome        | `chrome`
Google Chrome Canary | `chrome-canary`
Internet Explorer    | `ie`
Microsoft Edge       | `edge`
Mozilla Firefox      | `firefox`
Opera                | `opera`
Safari               | `safari`

The list of all the available browsers can be obtained by calling the `testcafe` command
with the [--list-browsers](../command-line-interface.md#-b---list-browsers) flag.

To run tests in a different local browser, specify the path to the browser executable file.

For more information and examples, see:

* Command line: [Local Browsers](../command-line-interface.md#local-browsers)
* API: [runner.browsers](../programming-interface/runner.md#browsers)

## Portable Browsers

To use a portable browser, specify the path to the browser executable file. For more information and examples, see:

* Command line: [Portable Browsers](../command-line-interface.md#portable-browsers)
* API: [runner.browsers](../programming-interface/runner.md#browsers)

## Browsers on Remote Devices

To run tests on a remote mobile and desktop device, this device must have network access to the TestCafe server.

First, you will need to create a remote browser connection.

* Command line: specify the `remote` *alias* (see [Remote Browsers](../command-line-interface.md#remote-browsers))
* API: use the [createBrowserConnection](../programming-interface/testcafe.md#createbrowserconnection) method

After that, TestCafe will provide a URL to open on the remote device in the browser against which you want to test.
As you open this URL, the browser connects to the TestCafe server and starts testing.

## Browsers in Cloud Testing Services

TestCafe allows you to use browsers from cloud testing services. You can access them through [browser provider plugins](../../extending-testcafe/browser-provider-plugin/).

The following plugins for cloud services are currently provided by the TestCafe team.

Service                              | Plugin
------------------------------------ | -------------------
[Sauce Labs](https://saucelabs.com/)          | [testcafe-browser-provider-saucelabs](https://www.npmjs.com/package/testcafe-browser-provider-saucelabs)
[BrowserStack](https://www.browserstack.com/) | [testcafe-browser-provider-browserstack](https://www.npmjs.com/package/testcafe-browser-provider-browserstack)

You can search npm for plugins developed by the community. Their names begin with the `testcafe-browser-provider-` prefix: [https://www.npmjs.com/search?q=testcafe-browser-provider](https://www.npmjs.com/search?q=testcafe-browser-provider).

You can also create your own plugin. See [Browser Provider Plugin](../../extending-testcafe/browser-provider-plugin/) for instructions.

## Using Chrome-specific Features

Using the [Chrome Debugging Protocol (CDP)](https://chromedevtools.github.io/devtools-protocol/), TestCafe provides the following Chrome-specific features:

* [Running Tests in Headless Mode](#running-tests-in-headless-mode)
* [Running Tests in the Device Emulation Mode](#running-tests-in-the-device-emulation-mode)

CDP requires a remote debugging port to attach to a Chrome instance. TestCafe automatically assigns a free port but you can specify a custom port via the `cdpPort` argument if necessary:

```sh
testcafe "chrome:headless:cdpPort=9223" tests/sample-fixture.js
```

### Running Tests in Headless Mode

TestCafe allows you to run tests in Google Chrome without any visible UI shell - in the [headless mode](https://developers.google.com/web/updates/2017/04/headless-chrome). Note that the [Take screenshot](../../test-api/actions/take-screenshot.md) and [Resize window](../../test-api/actions/resize-window.md) features are fully supported in headless mode.

```sh
testcafe "chrome:headless" tests/sample-fixture.js
```

Specify a path to installation location, if you install a portable version of Chrome:

```sh
testcafe "chrome:path/to/chrome:headless" tests/sample-fixture.js
```

> In headless mode the browser's viewport size is `1280x800` by default. You can change it via the [ResizeWindow](../../test-api/actions/resize-window.md) command or via [Device Emulation Mode](#running-tests-in-the-device-emulation-mode) parameters.

### Running Tests in the Device Emulation Mode

You can run test in Chrome's built-in [device emulator](https://developers.google.com/web/tools/chrome-devtools/device-mode/):

```sh
testcafe "chrome:emulation:device=iphone 6" tests/sample-fixture.js
```

```sh
testcafe "chrome:emulation:width=100;height=200;mobile=true;orientation=vertical;touch=true" tests/sample-fixture.js
```

You can combine both device emulation and headless modes:

```sh
testcafe "chrome:headless:emulation:device=iphone 6;cdpPort=9223" tests/sample-fixture.js
```

### Available Chrome Options

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

## Nonconventional Browsers

To use a web browser of a different type, you will need a [browser provider plugin](../../extending-testcafe/browser-provider-plugin/).

You can search npm for plugins developed by the community. Their names begin with the `testcafe-browser-provider-` prefix: [https://www.npmjs.com/search?q=testcafe-browser-provider](https://www.npmjs.com/search?q=testcafe-browser-provider).

You can also create your own plugin. See [Browser Provider Plugin](../../extending-testcafe/browser-provider-plugin/) for instructions.
