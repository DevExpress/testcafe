---
layout: docs
title: Testing in Headless Mode
permalink: /documentation/using-testcafe/common-concepts/browsers/testing-in-headless-mode.html
---
# Testing in Headless Mode

TestCafe allows you to run tests in Google Chrome and Mozilla Firefox without any visible UI shell - in the headless mode ([Chrome Headless](https://developers.google.com/web/updates/2017/04/headless-chrome), [Firefox Headless](https://developer.mozilla.org/en-US/Firefox/Headless_mode)). Use the `headless` browser parameter to launch a browser in the headless mode.

```sh
testcafe "chrome:headless" tests/sample-fixture.js
```

```js
runner
    .src('tests/sample-fixture.js')
    .browsers('chrome:headless')
    .run();
```

Specify a path to the browser executable if you use a portable version of the browser:

```sh
testcafe "firefox:path/to/firefox:headless" tests/sample-fixture.js
```

```js
runner
    .src('tests/sample-fixture.js')
    .browsers('firefox:path/to/firefox:headless')
    .run();
```

Note that the [Take screenshot](../../../test-api/actions/take-screenshot.md) and [Resize window](../../../test-api/actions/resize-window.md) features are fully supported in the headless mode.

> In the headless mode, the browser's viewport size is `1280x800` by default. You can change it via the [ResizeWindow](../../../test-api/actions/resize-window.md) command or via [Device Emulation Mode](using-chrome-device-emulation.md#emulator-parameters) parameters (for Chrome).

## CDP Port

[Chrome Debugging Protocol (CDP)](https://chromedevtools.github.io/devtools-protocol/) requires a remote debugging port to attach to a Chrome instance. TestCafe automatically assigns a free port but you can specify a custom port via the `cdpPort` argument if necessary:

```sh
testcafe "chrome:headless:cdpPort=9223" tests/sample-fixture.js
```

```js
runner
    .src('tests/sample-fixture.js')
    .browsers('chrome:headless:cdpPort=9223')
    .run();
```
