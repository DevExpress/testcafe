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

## Automation Port

Chrome and Firefox require a remote control port for TestCafe to attach to the browser instance. TestCafe automatically assigns a free port but you can specify a custom port via the `cdpPort` argument for Chrome and the `marionettePort` argument for Firefox.

```sh
testcafe "chrome:headless:cdpPort=9223" tests/sample-fixture.js
```

```js
runner
    .src('tests/sample-fixture.js')
    .browsers('chrome:headless:cdpPort=9223')
    .run();
```

```sh
testcafe "firefox:headless:marionettePort=9223" tests/sample-fixture.js
```

```js
runner
    .src('tests/sample-fixture.js')
    .browsers('firefox:headless:marionettePort=9223')
    .run();
```
