---
layout: docs
title: Identify the Browser and Platform
permalink: /documentation/test-api/identify-the-browser-and-platform.html
checked: true
---
# Identify the Browser and Platform

TestCafe allows you to obtain information about the current user agent in test code. These data identify the operating system, platform type, browser, engine, etc.

Use the `t.browser` property to access user agent data.

```js
import { Selector } from 'testcafe';

fixture `My fixture`
    .page `https://example.com`;

test('My test', async t => {
    if (t.browser.name !== 'Chrome')
        await t.expect(Selector('div').withText('Browser not supported').visible).ok();
});
```

`t.browser` exposes the following properties:

Property | Description   | Example
-------- | ------------- | -------
[alias](#alias) | The browser alias string specified when tests were launched. | `firefox:headless`
[name](#name) | The browser name. | `Chrome`
[version](#version) | The browser version. | `77.0.3865.120`
[platform](#platform) | The platform type. | `desktop`
[headless](#headless) | `true` if the browser runs in headless mode.
[os](#os) | The name and version of the operating system. | `{ name: 'macOS', version: '10.15.1' }`
[engine](#engine) | The name and version of the browser engine. |  `{ name: 'Gecko', version: '20100101' }`
[userAgent](#useragent) | The user agent string. | `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/77.0.3865.120 Safari/537.36`
[prettyUserAgent](#prettyuseragent) | Formatted string with the browser's and operating system's name and version. | `Chrome 77.0.3865.75 / macOS 10.14.0`

## Properties

### alias

The [browser alias](../using-testcafe/common-concepts/browsers/browser-support.md) string specified when tests were launched.

For [locally installed](../using-testcafe/common-concepts/browsers/browser-support.md#locally-installed-browsers) browsers, this property contains the short browser name:

```js
{
    alias: 'chrome'
}
```

For [portable](../using-testcafe/common-concepts/browsers/browser-support.md#portable-browsers) browsers, `alias` returns the `path:` prefix followed by the path to the browser executable:

```js
{
    alias: 'path:C:\Program Files (x86)\Firefox Portable\firefox.exe'
}
```

Browser alias flags ([:headless](../using-testcafe/common-concepts/browsers/testing-in-headless-mode.md), [:emulation](../using-testcafe/common-concepts/browsers/using-chrome-device-emulation.md), etc.) and command line parameters are included in the alias string:

```js
{
    alias: 'chrome:headless --no-sandbox'
}
```

```js
{
    alias: 'firefox:headless:disableMultiprocessing=true'
}
```

For [cloud testing services](../using-testcafe/common-concepts/browsers/browser-support.md#browsers-in-cloud-testing-services) and browsers acessed through [browser providers](../using-testcafe/common-concepts/browsers/browser-support.md#nonconventional-browsers), the `alias` property value is a string with all the specified browser, operating system and device parameters:

```js
{
    alias: 'saucelabs:Samsung Galaxy S9 Plus WQHD GoogleAPI Emulator@8.1'
}
```

### name

The short browser name.

```js
{
    name: 'Safari'
}
```

```js
{
    name: 'Internet Explorer'
}
```

If the browser cannot be [detected automatically](../using-testcafe/common-concepts/browsers/browser-support.md#locally-installed-browsers), TestCafe sets the `name` property to `'Other'`.

### version

The browser version.

```js
{
    name: 'Chrome',
    version: '77.0.3865.120'
}
```

```js
{
    name: 'Firefox',
    version: '69.0'
}
```

### platform

Identifies the platform type. This property can have the following values:

* `desktop`
* `mobile`
* `tablet`

```js
{
    name: 'Firefox',
    platform: 'mobile'
}
```

### headless

Specifies if the browser is in [headless mode](../using-testcafe/common-concepts/browsers/testing-in-headless-mode.md).

```js
{
    alias: 'chrome:headless',
    name: 'Chrome',
    headless: true
}
```

### os

Provides the operating system's `name` and `version`.

```js
{
    os: {
        name: 'Windows',
        version: '10'
    }
}
```

If the operating system cannot be detected, TestCafe sets the `os.name` property to `'Other'`.

### engine

Provides the browser engine's `name` and `version`.

```js
{
    engine: {
        name: 'WebKit',
        version: '605.1.15'
    }
}
```

### userAgent

The user agent string.

```js
{
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/77.0.3865.120 Safari/537.36'
}
```

### prettyUserAgent

The formatted name and version of the browser and operating system. This string is displayed on the TestCafe loading screen and in the status bar.

```js
{
    prettyUserAgent: 'Firefox 69.0 / Windows 10'
}
```

```js
{
    prettyUserAgent: 'Chrome 77.0.3865.120 / macOS 10.15.1'
}
```

## Examples

### Create a Browser-Specific Hook

The following example shows how to create a [beforeEach](test-code-structure.md#test-hooks) hook that runs for only particular [browser engines](#engine).

```js
import { Selector } from 'testcafe';

fixture `My fixture`
    .page `https://example.com`
    .beforeEach(async t => {
        if (t.browser.engine.name === 'Blink')
            return;

        // ...
    });
```

### Generate the Screenshot File Name

This example shows how to generate the screenshot path based on the [browser name](#name). This prevents screenshots taken with [t.takeElementScreenshot](actions/take-screenshot.md#take-a-screenshot-of-a-page-element) from being overwritten.

```js
import { Selector } from 'testcafe';

fixture `My fixture`
    .page `https://example.com`;

test('My test', async t => {
    const loginButton = Selector('div').withText('Login');

    await t.takeElementScreenshot(loginButton, `auth/${t.browser.name}/login-button.png`);
});
```

### Verify the Installer Version

The following example verifies that the website detects the user's platform correctly and offers to download the right installer. This test uses the [t.browser.os.name](#os) property to determine the operating system and check the installer name.

```js
import { Selector } from 'testcafe';

fixture `My fixture`
    .page `https://example.com`;

const downloadButton = Selector('a').withText('Download');

test('Check the installer platform', async t => {
    let installerName;

    switch (t.browser.os.name) {
        case 'Windows':
            installerName = 'myapp-win.exe';
            break;
        case 'macOS':
            installerName = 'myapp-mac.dmg';
            break;
        default:
            installerName = 'myapp-linux.tar.gz';
            break;
    }

    await t.expect(downloadButton.getAttribute('href')).contains(installerName);
});
```

### Block Ads on Mobile Devices

The following example uses the [t.browser.platform](#platform) property to determine the platform and [attach](intercepting-http-requests/attaching-hooks-to-tests-and-fixtures.md) a [request mock](intercepting-http-requests/mocking-http-requests.md) that blocks ad banners if the test runs on a mobile device.

```js
import { RequestMock } from 'testcafe';

const mobileAdMock = RequestMock()
    .onRequestTo(/bannernetwork.com/)
    .respond((req, res) => { res.statusCode = '404'; });

fixture `My fixture`
    .beforeEach(async t => {
        if (t.browser.platform === 'mobile')
            await t.addRequestHooks(mobileAdMock);

        await t.navigateTo('https://mysite.com/tested/page/');
    });

test('My test', async t => {
    // ...
});
```
