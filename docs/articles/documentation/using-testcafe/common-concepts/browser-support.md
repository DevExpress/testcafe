---
layout: docs
title: Browser Support
permalink: /documentation/using-testcafe/common-concepts/browser-support.html
---
# Browser Support

TestCafe allows you to test against different web browsers.
The most popular browsers are [supported directly](#directly-supported-browsers),
while others require a [browser provider plugin](#browser-provider-plugins).

The topic contains the following sections.

* [Directly Supported Browsers](#directly-supported-browsers)
* [Browser Provider Plugins](#browser-provider-plugins)
* [Specifying Browsers for Test Task](#specifying-browsers-for-test-task)

## Directly Supported Browsers

TestCafe supports testing against the following browsers out-of-the-box.

Browser           |Version | Short Browser Name
----------------- | ------ | -------------------
Chromium          | 22+    | `chromium`
Google Chrome     | 22+    | `chrome`
Internet Explorer | 9+     | `ie`
Microsoft Edge    |        | `edge`
Mozilla Firefox   | 17+    | `firefox`
Opera             | 15+    | `opera`
Safari            | 6+     | `safari`

## Browser Provider Plugins

If you need to use a browser that is not [supported directly](#directly-supported-browsers), create a [browser provider plugin](../../extending-testcafe/custom-browser-provider-plugin/).

Created provider packages can be published to npm. The provider package name consists of two parts - the `testcafe-browser-provider-` prefix and the name of a provider itself; for example, `testcafe-browser-provider-saucelabs`.
So, you can search for available browser provider packages on npm by the `testcafe-browser-provider-` prefix: [https://www.npmjs.com/search?q=testcafe-browser-provider](https://www.npmjs.com/search?q=testcafe-browser-provider).

For example, there are provider packages for testing in [Sauce Labs](https://saucelabs.com/) and [PhantomJS](http://phantomjs.org/) browsers:

* [testcafe-browser-provider-saucelabs](https://www.npmjs.com/package/testcafe-browser-provider-saucelabs)
* [testcafe-browser-provider-phantomjs](https://www.npmjs.com/package/testcafe-browser-provider-phantomjs)

You can install browser providers packages from npm as you would install any other plugin. See [Installing Plugins](../../extending-testcafe/index.md#installing-plugins).

## Specifying Browsers for Test Task

If you are working with TestCafe through the command line,
[list the desired browsers](../command-line-interface.md#browser-list)
within the `testcafe` command.

In case you are using the API, specify the browsers
with the [runner.browsers](../programming-interface/runner.md#browsers) method.

To identify browsers, different approaches are used:

Browser&#160;Type  | Specified by
------------------ | ----------------------------------
Local browser      | The path to the browser executable or browser short name. For the full list of names, see the table in the [Directly Supported Browsers](#directly-supported-browsers) section. To obtain the list of browsers installed on the current machine, run TestCafe from the command line with the [-b option](../command-line-interface.md#-b---list-browsers).
Browser&#160;accessed&#160;through a&#160;[browser&#160;provider&#160;plugin](../common-concepts/browser-support.md#browser-provider-plugins). | The browser alias that consists of the browser provider name and the name of a browser itself.
Remote browser     | The `remote` alias or [BrowserConnection](../programming-interface/browserconnection.md).