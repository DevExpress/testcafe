---
layout: post
title: TestCafe v1.8.0 Released
permalink: /blog/:title.html
---
# TestCafe v1.8.0 Released

In this release, we have added support for the new Chromium-based Microsoft Edge.

<!--more-->

## 🌟 Support for the New Microsoft Edge

TestCafe v1.8.0 supports the new Microsoft Edge based on Chromium. The new Edge is available under the same [alias](../documentation/guides/concepts/browsers.md#locally-installed-browsers): `edge`.

```sh
testcafe edge test.js
```

```js
await runner
    .src('test.js')
    .browsers('edge')
    .run();
```

Supported Edge's features include [headless mode](../documentation/guides/concepts/browsers.md#test-in-headless-mode), [mobile device emulation](../documentation/guides/concepts/browsers.md#use-chromium-device-emulation), and [video recording](../documentation/guides/advanced-guides/screenshots-and-videos.md#record-videos).

## Bug Fixes

* Fixed an error thrown when the webpage creates a `Proxy` ([testcafe-hammerhead/#2206](https://github.com/DevExpress/testcafe-hammerhead/issues/2206)) by [@link89](https://github.com/link89)
* Event handlers are no longer cleared after the `document.open` function call ([testcafe-hammerhead/#1881](https://github.com/DevExpress/testcafe-hammerhead/issues/1881))
