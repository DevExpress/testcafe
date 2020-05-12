---
layout: docs
title: t.browser Property
permalink: /documentation/reference/test-api/testcontroller/browser.html
---
# t.browser Property

Returns information about the current user agent: the operating system, platform type, browser, engine, etc.

```text
t.browser
```

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
[alias](#alias) | String | The browser alias string specified when tests are launched. | `firefox:headless`
[name](#name) | String | The browser name. | `Chrome`
[version](#version) | String | The browser version. | `77.0.3865.120`
[platform](#platform) | String | The platform type. | `desktop`
[headless](#headless) | Boolean | `true` if the browser runs in headless mode. | `false`
[os](#os) | Object | The name and version of the operating system. | `{ name: 'macOS', version: '10.15.1' }`
[engine](#engine) | Object | The name and version of the browser engine. |  `{ name: 'Gecko', version: '20100101' }`
[userAgent](#useragent) | String | The user agent string. | `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/77.0.3865.120 Safari/537.36`
[prettyUserAgent](#prettyuseragent) | String | Formatted string with the browser and operating system's name and version. | `Chrome 77.0.3865.75 / macOS 10.14.0`

## Properties

### alias

The [browser alias](../../../guides/concepts/browsers.md#locally-installed-browsers) string specified when tests were launched.

For [locally installed](../../../guides/concepts/browsers.md#locally-installed-browsers) browsers, this property contains the short browser name:

```js
{
    alias: 'chrome'
}
```

For [portable](../../../guides/concepts/browsers.md#portable-browsers) browsers, `alias` returns the `path:` prefix followed by the path to the browser executable:

```js
{
    alias: 'path:C:\Program Files (x86)\Firefox Portable\firefox.exe'
}
```

Browser alias flags ([:headless](../../../guides/concepts/browsers.md#test-in-headless-mode), [:emulation](../../../guides/concepts/browsers.md#use-chromium-device-emulation), etc.) and command line parameters are included in the alias string:

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

For [cloud testing services](../../../guides/concepts/browsers.md#browsers-in-cloud-testing-services) and browsers acessed through [browser providers](../../../guides/concepts/browsers.md#nonconventional-browsers), the `alias` property value is a string with all the specified browser parameters, and operating system and device parameters:

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

If the browser cannot be [detected automatically](../../../guides/concepts/browsers.md#locally-installed-browsers), the `name` property is set to `'Other'`.

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

The `version` property is set to `'0.0'` if the browser version cannot be determined.

### platform

Identifies the platform type. This property can have the following values:

* `desktop`
* `mobile`
* `tablet`
* `other` (identifies other platforms, or indicates that the platform cannot be detected)

```js
{
    name: 'Firefox',
    platform: 'mobile'
}
```

### headless

Specifies if the browser is in [headless mode](../../../guides/concepts/browsers.md#test-in-headless-mode).

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

If the operating system cannot be detected, the `os.name` property is set to `'Other'`. The `os.version` property defaults to `'0.0'` if TestCafe is unable to determine the OS version.

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

If the browser engine cannot be detected, the `engine.name` property is set to `'Other'`. The `engine.version` property defaults to `'0.0'` if TestCafe is unable to determine the engine version.

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

The `prettyUserAgent` property is set to an empty string if TestCafe cannot parse the user agent.
