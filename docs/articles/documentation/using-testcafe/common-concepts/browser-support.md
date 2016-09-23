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

You can specify browsers for testing either using the [command line interface](../command-line-interface.md) (CLI) or [application programming intefrace](../programming-interface/index.md) (API).

## Local Browsers

TestCafe includes out-of-the-box support for the following browsers installed locally on your computer.

Browser           |Version | Browser Alias
----------------- | ------ | -------------------
Chromium          | latest | `chromium`
Google Chrome     | latest | `chrome`
Internet Explorer | 9+     | `ie`
Microsoft Edge    |        | `edge`
Mozilla Firefox   | latest | `firefox`
Opera             | latest | `opera`
Safari            | latest | `safari`

It also supports the two latest versions of Android and iOS browsers.

You can specify local browsers by using *browser aliases* (see the table above) or paths to their executable files. For more information and examples, see:

* using CLI: [Local Browsers](../command-line-interface.md#local-browsers)
* using API: [runner.browsers](../programming-interface/runner.md#browsers)

The list of all the available browsers can be obtained by calling the [--list-browsers](../command-line-interface.md#-b---list-browsers) command.

## Portable Browsers

You can also test against browsers run on portable storage devices.

You specify these browsers by paths to browser executable files. For more information and examples, see:

* using CLI: [Portable Browsers](../command-line-interface.md#portable-browsers)
* using API: [runner.browsers](../programming-interface/runner.md#browsers)

## Remote Browsers

TestCafe can run tests in browsers on remote devices. The only requirement is a device should have network access to the TestCafe server.

At first, you need to create a remote browser connection. There are two ways to do this:

* using CLI: by specifying the `remote` *alias* (see [Remote Browsers](../command-line-interface.html#remote-browsers))
* using API: by running the [createBrowserConnection](../programming-interface/testcafe.html#createbrowserconnection) method

After that, TestCafe will provide URLs that you need to open in required browsers on your remote device to start testing.

## Cloud Browsers

TestCafe allows you to use cloud browsers. These browsers can be accessed through [browser provider plugins](../../extending-testcafe/browser-provider-plugin/).

For example, there is the [testcafe-browser-provider-saucelabs](https://www.npmjs.com/package/testcafe-browser-provider-saucelabs) plugin for testing in [Sauce Labs](https://saucelabs.com/).

If you need to use another cloud browser, see [Other Browsers](#other-browsers).

## Other Browsers

To use a different browser, create a custom [browser provider plugin](../../extending-testcafe/browser-provider-plugin/).

Created browser provider packages can be published to npm. The provider package name consists of two parts - the `testcafe-browser-provider-` prefix and the name of a provider itself; e.g., `testcafe-browser-provider-saucelabs`.
So, you can search for available browser provider packages on npm by the `testcafe-browser-provider-` prefix: [https://www.npmjs.com/search?q=testcafe-browser-provider](https://www.npmjs.com/search?q=testcafe-browser-provider).

For example, there is the [testcafe-browser-provider-phantomjs](https://www.npmjs.com/package/testcafe-browser-provider-phantomjs) plugin for tesing in the [PhantomJS](http://phantomjs.org/) headless browser.

To learn how to specify these browsers, see [Specifying a Browser for a Test Task](../../extending-testcafe/browser-provider-plugin/index.md#specifying-a-browser-for-a-test-task).