---
layout: docs
title: Browser Support
permalink: /documentation/using-testcafe/common-concepts/browser-support.html
---
# Browser Support

TestCafe allows you to test against different web browsers:

* [Local Browsers](#local-browsers)
* [Portable Browsers](#portable-browsers)
* [Remote Browsers](#remote-browsers)
* [Cloud Browsers](#cloud-browsers)

If you are working with TestCafe through the command line interface (CLI),
[list the desired browsers](../command-line-interface.md#browser-list)
within the `testcafe` command.

In case you are using the application programming intefrace (API), specify the browsers
with the [runner.browsers](../programming-interface/runner.md#browsers) method.

## Local Browsers

The following local browsers are supported out-of-the-box.

Browser           |Version | Browser Alias
----------------- | ------ | -------------------
Chromium          | 22+    | `chromium`
Google Chrome     | 22+    | `chrome`
Internet Explorer | 9+     | `ie`
Microsoft Edge    |        | `edge`
Mozilla Firefox   | 17+    | `firefox`
Opera             | 15+    | `opera`
Safari            | 6+     | `safari`

You can specify local browsers by using *paths* or *browser aliases* (see the table above).
The list of all the available browsers can be obtained by calling the [--list-browsers](../command-line-interface.md#-b---list-browsers) command.

## Portable Browsers

Supported portable browsers:

* Google Chrome Portable
* Firefox Portable

You can specify them by using *paths* to browser executable files.

## Remote Browsers

TestCafe can run tests in browsers on remote devices. The only requirement is a device should have network access to the TestCafe server.

At first, you need to create a remote browser connection. You can do this from CLI by specifying the `remote` *alias* or from API by using the [createBrowserConnection](../programming-interface/testcafe.html#createbrowserconnection) method.

After that, TestCafe will provide URLs that you need to open in required browsers on your remote device to start testing.

## Cloud Browsers

TestCafe allows you to use cloud browsers that can be accessed through *browser provider plugins*.

For example, there are browser provider plugins for testing in [Sauce Labs](https://saucelabs.com/) and [PhantomJS](http://phantomjs.org/) browsers:

* [testcafe-browser-provider-saucelabs](https://www.npmjs.com/package/testcafe-browser-provider-saucelabs)
* [testcafe-browser-provider-phantomjs](https://www.npmjs.com/package/testcafe-browser-provider-phantomjs)

If you need to use a different cloud browser, create a custom [browser provider plugin](../../extending-testcafe/browser-provider-plugin/).

> Created browser provider packages can be published to npm. The provider package name consists of two parts - the `testcafe-browser-provider-` prefix and the name of a provider itself; e.g., `testcafe-browser-provider-saucelabs`.
So, you can search for available browser provider packages on npm by the `testcafe-browser-provider-` prefix: [https://www.npmjs.com/search?q=testcafe-browser-provider](https://www.npmjs.com/search?q=testcafe-browser-provider).

To specify a cloud browser for a test task, use a *browser alias* that consists of the browser provider name and the name of a browser itself; for example, `saucelabs:Chrome@52.0:Windows 8.1`.