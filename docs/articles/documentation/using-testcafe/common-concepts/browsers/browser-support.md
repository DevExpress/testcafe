---
layout: docs
title: Browser Support
permalink: /documentation/using-testcafe/common-concepts/browsers/browser-support.html
---
# Browser Support

* [Officially Supported Browsers](#officially-supported-browsers)
* [Locally Installed Browsers](#locally-installed-browsers)
* [Portable Browsers](#portable-browsers)
* [Browsers on Remote Devices](#browsers-on-remote-devices)
* [Browsers in Cloud Testing Services](#browsers-in-cloud-testing-services)
* [Nonconventional Browsers](#nonconventional-browsers)

## Officially Supported Browsers

While TestCafe is designed to support most modern browsers, there are a limited number
of *officially supported* browsers against which TestCafe is actively tested.

* Google Chrome: Stable, Beta, Dev and Canary
* Internet Explorer (11+)
* Microsoft Edge
* Mozilla Firefox
* Safari
* Android browser
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
with the [--list-browsers](../../command-line-interface.md#-b---list-browsers) flag.

To run tests in a different local browser, specify the path to the browser executable file.

For more information and examples, see:

* Command line: [Local Browsers](../../command-line-interface.md#local-browsers)
* API: [runner.browsers](../../programming-interface/runner.md#browsers)

## Portable Browsers

To use a portable browser, specify the path to the browser executable file. For more information and examples, see:

* Command line: [Portable Browsers](../../command-line-interface.md#portable-browsers)
* API: [runner.browsers](../../programming-interface/runner.md#browsers)

## Browsers on Remote Devices

To run tests on a remote mobile and desktop device, this device must have network access to the TestCafe server.

First, you will need to create a remote browser connection.

* Command line: specify the `remote` *alias* (see [Remote Browsers](../../command-line-interface.md#remote-browsers))
* API: use the [createBrowserConnection](../../programming-interface/testcafe.md#createbrowserconnection) method

After that, TestCafe will provide a URL to open on the remote device in the browser against which you want to test.
As you open this URL, the browser connects to the TestCafe server and starts testing.

## Browsers in Cloud Testing Services

TestCafe allows you to use browsers from cloud testing services. You can access them through [browser provider plugins](../../../extending-testcafe/browser-provider-plugin/).

The following plugins for cloud services are currently provided by the TestCafe team.

Service                              | Plugin
------------------------------------ | -------------------
[Sauce Labs](https://saucelabs.com/)          | [testcafe-browser-provider-saucelabs](https://www.npmjs.com/package/testcafe-browser-provider-saucelabs)
[BrowserStack](https://www.browserstack.com/) | [testcafe-browser-provider-browserstack](https://www.npmjs.com/package/testcafe-browser-provider-browserstack)

You can search npm for plugins developed by the community. Their names begin with the `testcafe-browser-provider-` prefix: [https://www.npmjs.com/search?q=testcafe-browser-provider](https://www.npmjs.com/search?q=testcafe-browser-provider).

You can also create your own plugin. See [Browser Provider Plugin](../../../extending-testcafe/browser-provider-plugin/README.md) for instructions.

## Nonconventional Browsers

To use a web browser of a different type, you will need a [browser provider plugin](../../../extending-testcafe/browser-provider-plugin/README.md).

You can search npm for plugins developed by the community. Their names begin with the `testcafe-browser-provider-` prefix: [https://www.npmjs.com/search?q=testcafe-browser-provider](https://www.npmjs.com/search?q=testcafe-browser-provider).

You can also create your own plugin. See [Browser Provider Plugin](../../../extending-testcafe/browser-provider-plugin/README.md) for instructions.
