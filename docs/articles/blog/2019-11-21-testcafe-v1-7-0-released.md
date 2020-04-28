---
layout: post
title: TestCafe v1.7.0 Released
permalink: /blog/:title.html
---
# TestCafe v1.7.0 Released

This release introduces access to the browser and platform information from test code.

<!--more-->

## Enhancements

### ⚙️ Identify the Browser and Platform in Test Code ([#481](https://github.com/DevExpress/testcafe/issues/481))

TestCafe now allows you to obtain information about the current user agent. These data identify the operating system, platform type, browser, engine, etc.

Use the [t.browser](../documentation/reference/test-api/testcontroller/browser.md) property to access user agent data.

```js
import { Selector } from 'testcafe';

fixture `My fixture`
    .page `https://example.com`;

test('My test', async t => {
    if (t.browser.name !== 'Chrome')
        await t.expect(Selector('div').withText('Browser not supported').visible).ok();
});
```

The [t.browser](../documentation/reference/test-api/testcontroller/browser.md) object exposes the following properties:

Property | Type | Description   | Example
-------- | ---- | ------------- | -------
[alias](../documentation/reference/test-api/testcontroller/browser.md#alias) | String | The browser alias string specified when tests were launched. | `firefox:headless`
[name](../documentation/reference/test-api/testcontroller/browser.md#name) | String | The browser name. | `Chrome`
[version](../documentation/reference/test-api/testcontroller/browser.md#version) | String | The browser version. | `77.0.3865.120`
[platform](../documentation/reference/test-api/testcontroller/browser.md#platform) | String | The platform type. | `desktop`
[headless](../documentation/reference/test-api/testcontroller/browser.md#headless) | Boolean | `true` if the browser runs in headless mode. | `false`
[os](../documentation/reference/test-api/testcontroller/browser.md#os) | Object | The name and version of the operating system. | `{ name: 'macOS', version: '10.15.1' }`
[engine](../documentation/reference/test-api/testcontroller/browser.md#engine) | Object | The name and version of the browser engine. |  `{ name: 'Gecko', version: '20100101' }`
[userAgent](../documentation/reference/test-api/testcontroller/browser.md#useragent) | String | The user agent string. | `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/77.0.3865.120 Safari/537.36`
[prettyUserAgent](../documentation/reference/test-api/testcontroller/browser.md#prettyuseragent) | String | Formatted string with the browser's and operating system's name and version. | `Chrome 77.0.3865.75 / macOS 10.14.0`

The following example shows how to create a [beforeEach](../documentation/reference/test-api/fixture/beforeeach.md) hook that runs for specific [browser engines](../documentation/reference/test-api/testcontroller/browser.md#engine).

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

You can also use [t.browser](../documentation/reference/test-api/testcontroller/browser.md) to generate the screenshot path based on the [browser name](../documentation/reference/test-api/testcontroller/browser.md#name). This prevents screenshots taken with [t.takeElementScreenshot](../documentation/reference/test-api/testcontroller/takeelementscreenshot.md) in different browsers from being overwritten.

```js
import { Selector } from 'testcafe';

fixture `My fixture`
    .page `https://example.com`;

test('My test', async t => {
    const loginButton = Selector('div').withText('Login');

    await t.takeElementScreenshot(loginButton, `auth/${t.browser.name}/login-button.png`);
});
```

For more information and examples, see [Identify the Browser and Platform](../documentation/guides/advanced-guides/detect-the-client-browser-and-platform.md).

## Bug Fixes

* Fixed an error on pages that submit forms immediately after loading ([#4360](https://github.com/DevExpress/testcafe/issues/4360) by [@bill-looby-i](https://github.com/bill-looby-i))
* TestCafe now scrolls to elements located inside Shadow DOM roots ([#4222](https://github.com/DevExpress/testcafe/issues/4222))
* Fixed an error that occurred when TypeScripts tests that use Node.js globals were run with TestCafe installed globally ([#4437](https://github.com/DevExpress/testcafe/issues/4437))
* Fixed the TypeScript definition for the `Selector.withAttribute` method's return type ([#4448](https://github.com/DevExpress/testcafe/issues/4448))
* Fixed an issue when custom browser providers could not take screenshots ([#4477](https://github.com/DevExpress/testcafe/issues/4477))
* Support pages that use advanced ES6 module export ([testcafe-hammerhead/#2137](https://github.com/DevExpress/testcafe-hammerhead/issues/2137))
* Fixed compatibility issues with Salesforce Lightning Web Components ([testcafe-hammerhead/#2152](https://github.com/DevExpress/testcafe-hammerhead/issues/2152))
