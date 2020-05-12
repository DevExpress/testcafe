---
layout: docs
title: Detect the Client Browser and Platform
permalink: /documentation/guides/advanced-guides/detect-the-client-browser-and-platform.html
redirect_from:
  - /documentation/test-api/identify-the-browser-and-platform.html
---
# Detect the Client Browser and Platform

TestCafe allows you to obtain information about the current user agent in test code. This data identifies the operating system, platform type, browser, engine, etc.

Use the [t.browser](../../reference/test-api/testcontroller/browser.md) property to access user agent data.

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

Property | Type | Description   | Example
-------- | ---- | ------------- | -------
[alias](../../reference/test-api/testcontroller/browser.md#alias) | String | The browser alias string specified when tests are launched. | `firefox:headless`
[name](../../reference/test-api/testcontroller/browser.md#name) | String | The browser name. | `Chrome`
[version](../../reference/test-api/testcontroller/browser.md#version) | String | The browser version. | `77.0.3865.120`
[platform](../../reference/test-api/testcontroller/browser.md#platform) | String | The platform type. | `desktop`
[headless](../../reference/test-api/testcontroller/browser.md#headless) | Boolean | `true` if the browser runs in headless mode. | `false`
[os](../../reference/test-api/testcontroller/browser.md#os) | Object | The name and version of the operating system. | `{ name: 'macOS', version: '10.15.1' }`
[engine](../../reference/test-api/testcontroller/browser.md#engine) | Object | The name and version of the browser engine. |  `{ name: 'Gecko', version: '20100101' }`
[userAgent](../../reference/test-api/testcontroller/browser.md#useragent) | String | The user agent string. | `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/77.0.3865.120 Safari/537.36`
[prettyUserAgent](../../reference/test-api/testcontroller/browser.md#prettyuseragent) | String | Formatted string with the browser and operating system's name and version. | `Chrome 77.0.3865.75 / macOS 10.14.0`

## Examples

### Create a Browser-Specific Hook

The following example shows how to create a [beforeEach](../basic-guides/organize-tests.md#test-hooks) hook that runs for particular [browser engines](../../reference/test-api/testcontroller/browser.md#engine) only:

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

### Generate the Screenshot File Path

This example shows how to generate the screenshot path based on the [browser name](../../reference/test-api/testcontroller/browser.md#name). This prevents screenshots taken with [t.takeElementScreenshot](../../reference/test-api/testcontroller/takeelementscreenshot.md) in different browsers from being overwritten.

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

The following example verifies that the website detects the user's platform and offers to download the right installer. This test uses the [t.browser.os.name](../../reference/test-api/testcontroller/browser.md#os) property to determine the operating system and check the installer name.

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

### Handle Ads on Mobile Devices

The following example uses the [t.browser.platform](../../reference/test-api/testcontroller/browser.md#platform) property to determine the platform and [attach](intercept-http-requests.md#attach-hooks-to-tests-and-fixtures) a [request mock](intercept-http-requests.md#mock-http-requests) that blocks ad requests if the test runs on a mobile device.

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
