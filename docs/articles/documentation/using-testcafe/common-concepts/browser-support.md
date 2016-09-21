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
* [Other Browsers](#other-browsers)

If you are working with TestCafe through the command line interface (CLI),
[list the desired browsers](../command-line-interface.md#browser-list)
within the `testcafe` command.

In case you are using the application programming intefrace (API), specify the browsers
with the [runner.browsers](../programming-interface/runner.md#browsers) method.

## Local Browsers

The following local browsers are supported out-of-the-box.

Browser           |Version | Browser Alias
----------------- | ------ | -------------------
Chromium          | latest | `chromium`
Google Chrome     | latest | `chrome`
Internet Explorer | 9+     | `ie`
Microsoft Edge    |        | `edge`
Mozilla Firefox   | latest | `firefox`
Opera             | latest | `opera`
Safari            | latest | `safari`

TestCafe also supports the two latest versions of Android and iOS browsers.

You can specify local browsers by using *browser aliases* (see the table above) or paths to their executable files.
The list of all the available browsers can be obtained by calling the [--list-browsers](../command-line-interface.md#-b---list-browsers) command.

## Portable Browsers

To use portable browsers, specify them by paths to browser executable files.

## Remote Browsers

TestCafe can run tests in browsers on remote devices. The only requirement is a device should have network access to the TestCafe server.

At first, you need to create a remote browser connection. You can do this from CLI by specifying the `remote` *alias* or from API by using the [createBrowserConnection](../programming-interface/testcafe.html#createbrowserconnection) method.

After that, TestCafe will provide URLs that you need to open in required browsers on your remote device to start testing.

## Cloud Browsers

TestCafe allows you to use cloud browsers. These browsers can be accessed through *browser provider plugins*. For example, there is the [testcafe-browser-provider-saucelabs](https://www.npmjs.com/package/testcafe-browser-provider-saucelabs) plugin for testing in [Sauce Labs](https://saucelabs.com/).

To specify a Sauce Labs browser, use a browser alias that consists of the `saucelabs` prefix and the name of the browser itself, for example, `saucelabs:Chrome@52.0:Windows 8.1`.
To obtain all the available aliases for the Sauce Labs browser provider, run the `testcafe --list-browsers saucelabs` command.

If you need to use another cloud browser, see [Other Browsers](#other-browsers).

## Other Browsers

To use a different browser, create a custom [browser provider plugin](../../extending-testcafe/browser-provider-plugin/).

Created browser provider packages can be published to npm. The provider package name consists of two parts - the `testcafe-browser-provider-` prefix and the name of a provider itself; e.g., `testcafe-browser-provider-saucelabs`.
So, you can search for available browser provider packages on npm by the `testcafe-browser-provider-` prefix: [https://www.npmjs.com/search?q=testcafe-browser-provider](https://www.npmjs.com/search?q=testcafe-browser-provider).

For example, there is the [testcafe-browser-provider-phantomjs](https://www.npmjs.com/package/testcafe-browser-provider-phantomjs) plugin for tesing in the [PhantomJS](http://phantomjs.org/) headless browser.

When running tests, you can specify a browser accessed through a provider plugin by using a *browser alias*.
The alias consists of the browser provider name and the name of the browser itself (the latter can be omitted); for example, `saucelabs:Chrome@52.0:Windows 8.1` or `phantomjs`.

To obtain all the available aliases for your provider, run the `testcafe --list-browsers {shortProviderName}` command, where `{shortProviderName}` is the provider name (without the `testcafe-browser-provider-` prefix); for example, `testcafe --list-browsers my-provider`.