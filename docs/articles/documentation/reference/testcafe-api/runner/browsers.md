---
layout: docs
title: Runner.browsers Method
permalink: /documentation/reference/testcafe-api/runner/browsers.html
---
# Runner.browsers Method

Configures the test runner to run tests in the specified browsers.

```text
browsers(browser) → this
```

The `browser` parameter can be any of the following objects or an `Array` of them:

Parameter Type                                                                                        | Description                            | Browser Type
---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------
String &#124; Array                                                                                           | A different browser alias for each browser type. See [Browser Support](../../../guides/concepts/browsers.md) for more details.                            | [Local browsers](../../../guides/concepts/browsers.md#locally-installed-browsers), [cloud browsers](../../../guides/concepts/browsers.md#browsers-in-cloud-testing-services), and [browsers accessed through *browser provider plugins*](../../../guides/concepts/browsers.md#nonconventional-browsers).                                                                 |
 `{path: String, cmd: String}`                                                                        | The path to the browser's executable (`path`) and command line parameters (`cmd`). The `cmd` property is optional.                                                     | [Local](../../../guides/concepts/browsers.md#locally-installed-browsers) and [portable](../../../guides/concepts/browsers.md#portable-browsers) browsers
[BrowserConnection](../browserconnection/README.md)                                                            | The remote browser connection.                                                                                                                                        | [Remote browsers](../../../guides/concepts/browsers.md#browsers-on-remote-devices)

You do not need to call this function if you specify the [browsers](../../configuration-file.md#browsers) property in the [configuration file](../../configuration-file.md).

*Related configuration file property*: [browsers](../../configuration-file.md#browsers)

## Use Browser Aliases

You can identify locally installed browsers with predefined [browser aliases](../../../guides/concepts/browsers.md#locally-installed-browsers):

```js
runner.browsers(['safari', 'chrome']);
```

You can also use aliases to run browsers accessed with provider plugins, such as browsers in [cloud testing services](../../../guides/concepts/browsers.md#browsers-in-cloud-testing-services):

```js
runner.browsers('saucelabs:Chrome@52.0:Windows 8.1');
```

## Specify the Path to the Browser Executable

To specify the path to the browser executable, use the `path:` prefix. Enclose the path in backticks if it contains spaces:

```js
runner.browsers('path:`C:\\Program Files\\Internet Explorer\\iexplore.exe`');
```

## Specify the Path With Command Line Parameters

```js
runner.browsers({
    path: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    cmd: '--new-window'
});
```

## Headless Mode, Device Emulation and User Profiles

You can add postfixes to browser aliases to run tests in the [headless mode](../../../guides/concepts/browsers.md#test-in-headless-mode), use [Chrome device emulation](../../../guides/concepts/browsers.md#use-chromium-device-emulation) or [user profiles](../../../guides/concepts/browsers.md#user-profiles):

```js
runner.browsers('chrome:headless');
```

For portable browsers, use the browser alias followed by the path to an executable:

```js
runner.browsers('firefox:/home/user/apps/firefox.app:userProfile');
```

> The `path:` prefix does not support postfixes.

## Pass a Remote Browser Connection

```js
const createTestCafe = require('testcafe');
let runner           = null;
let testcafe         = null;

createTestCafe('localhost', 1337, 1338)
    .then(tc => {
        testcafe = tc;
        runner   = testcafe.createRunner();

        return testcafe.createBrowserConnection();
    })
    .then(remoteConnection => {

        // Outputs remoteConnection.url so that it can be visited from the remote browser.
        console.log(remoteConnection.url);

        remoteConnection.once('ready', () => {
            runner
                .src('test.js')
                .browsers(remoteConnection)
                .run()
                .then(failedCount => {
                    console.log(failedCount);
                    testcafe.close();
                 });
        });
    });
```
