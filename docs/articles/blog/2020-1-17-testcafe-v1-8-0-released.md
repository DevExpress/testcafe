---
layout: post
title: TestCafe v1.8.0 Released
permalink: /blog/:title.html
---
# TestCafe v1.8.0 Released

In this release, we have added support for the new Chromium-based Microsoft Edge.

<!--more-->

## 🌟 Support for the New Microsoft Edge

TestCafe v1.8.0 supports the new Microsoft Edge based on Chromium. The new Edge is available under the same [alias](../documentation/using-testcafe/common-concepts/browsers/browser-support.md#locally-installed-browsers): `edge`.

```sh
testcafe edge test.js
```

```js
await runner
    .src('test.js')
    .browsers('edge')
    .run();
```

Supported Edge's features include [headless mode](../documentation/using-testcafe/common-concepts/browsers/testing-in-headless-mode.md), [mobile device emulation](../documentation/using-testcafe/common-concepts/browsers/using-chromium-device-emulation.md), and [video recording](../documentation/using-testcafe/common-concepts/screenshots-and-videos.md#record-videos).

## Bug Fixes

* Fixed an error thrown when the webpage creates a `Proxy` ([testcafe-hammerhead/#2206](https://github.com/DevExpress/testcafe-hammerhead/issues/2206)) by [@link89](https://github.com/link89)
* Event handlers are no longer cleared after the `document.open` function call ([testcafe-hammerhead/#1881](https://github.com/DevExpress/testcafe-hammerhead/issues/1881))
