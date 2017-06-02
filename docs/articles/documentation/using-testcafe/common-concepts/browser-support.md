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
    * [Available CDP options](#available-cdp-options)
* [Nonconventional Browsers](#nonconventional-browsers)

## Officially Supported Browsers

While TestCafe is designed to support most modern browsers, there are a limited number
of *officially supported* browsers against which TestCafe is actively tested.

* Google Chrome
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

Browser           | Browser Alias
----------------- | -------------------
Chromium          | `chromium`
Google Chrome     | `chrome`
Internet Explorer | `ie`
Microsoft Edge    | `edge`
Mozilla Firefox   | `firefox`
Opera             | `opera`
Safari            | `safari`

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

### Running Tests in Headless Mode

TestCafe allows you to run tests in Google Chrome without any visible UI shell - in the [headless mode](https://developers.google.com/web/updates/2017/04/headless-chrome). Note that the [Take screenshot](../../test-api/actions/take-screenshot.html) and [Resize window](../../test-api/actions/resize-window.html) features are fully supported in headless mode.

```sh
testcafe "chrome:headless" tests/sample-fixture.js
```

You can specify a custom port for CDP:

```sh
testcafe "chrome:headless:cdpPort=9223" tests/sample-fixture.js
```

Note that headless mode is available for Mac and Linux in Chrome 59. You need a [Canary build](https://www.google.com/chrome/browser/canary.html) to enable headless mode on Windows. Specify a path to installation location, if you install a portable version of Chrome:

```sh
testcafe "chrome:path/to/chrome:headless" tests/sample-fixture.js
```

### Running Tests in the Device Emulation Mode

You can run test in Chrome's built-in [device emulator](https://developers.google.com/web/tools/chrome-devtools/device-mode/):

```sh
testcafe "chrome:emulation:device=iphone 6" tests/sample-fixture.js
testcafe "chrome:emulation:width=100;height=200;mobile=true;orientation=vertical;touch=true" tests/sample-fixture.js
```

You can combine both device emulation and headless modes:

```sh
testcafe "chrome:headless:emulation:device=iphone 6;cdpPort=9223" tests/sample-fixture.js
```

### Available CDP options

Usage:

```sh
chrome[:pathToBrowser][:headless][:emulation][:arg1=value1;arg2=value2][ --cmdArgs]
```

Options:

* **pathToBrowser** - specifies a path to a portable browser. The path to browser is not required, if it is installed in a system.
* **headless** - Chrome runs in [headless mode](https://developers.google.com/web/updates/2017/04/headless-chrome).
* **emulation** - allows you to run tests in Chrome [device emulator](https://developers.google.com/web/tools/chrome-devtools/device-mode/).
* **chrome arguments** - options separated by `;`.  The following arguments are available:
    * **device parameters**:
        * **device=\<string\>** - the emulated device;
        * **width=\<number\>** - the device screen width in pixels;
        * **height=\<number\>** - the device screen height in pixels;
        * **scaleFactor=\<number\>** - device scale factor value;
        * **mobile=\<bool\>** - whether to emulate a mobile device;
        * **orientation=\<vertical|horizontal\>** - the device orientation;
        * **userAgent=\<string\>** - the user agent string;
        * **touch=\<bool\>** - whether the touch support is enabled.
    * **CDP arguments**:
        * **cdpPort=\<int\>** - a free port used for the Chrome Debugging Protocol.
* **cmdArgs** - command line [arguments](../command-line-interface.html#starting-browser-with-arguments) that are passed to the chrome.

> The CDP requires a free port to work. TestCafe automatically selects a free port, but you can define a custom port.

## Nonconventional Browsers

To use a web browser of a different type, you will need a [browser provider plugin](../../extending-testcafe/browser-provider-plugin/).

You can search npm for plugins developed by the community. Their names begin with the `testcafe-browser-provider-` prefix: [https://www.npmjs.com/search?q=testcafe-browser-provider](https://www.npmjs.com/search?q=testcafe-browser-provider).

You can also create your own plugin. See [Browser Provider Plugin](../../extending-testcafe/browser-provider-plugin/) for instructions.
