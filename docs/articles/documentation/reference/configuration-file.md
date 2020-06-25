---
layout: docs
title: Configuration File
permalink: /documentation/reference/configuration-file.html
redirect_from:
  - /documentation/using-testcafe/configuration-file.html
---
# Configuration File

TestCafe uses the `.testcaferc.json` configuration file to store its settings.

> Important! Settings you specify when you run TestCafe from the [command line](command-line-interface.md) and programming interfaces override settings from `.testcaferc.json`. TestCafe prints information about every overridden property in the console.

Keep `.testcaferc.json` in the directory from which you run TestCafe. This is usually the project's root directory. TestCafe does not take into account configuration files located in other directories (for instance, project's subdirectories).

A configuration file can include the following settings:

* [browsers](#browsers)
* [src](#src)
* [reporter](#reporter)
* [screenshots](#screenshots)
  * [path](#screenshotspath)
  * [takeOnFails](#screenshotstakeonfails)
  * [pathPattern](#screenshotspathpattern)
  * [fullPage](#screenshotsfullpage)
* [disableScreenshots](#disablescreenshots)
* [screenshotPath](#screenshotpath) *(obsolete)*
* [takeScreenshotsOnFails](#takescreenshotsonfails) *(obsolete)*
* [screenshotPathPattern](#screenshotpathpattern) *(obsolete)*
* [videoPath](#videopath)
* [videoOptions](#videooptions)
* [videoEncodingOptions](#videoencodingoptions)
* [quarantineMode](#quarantinemode)
* [debugMode](#debugmode)
* [debugOnFail](#debugonfail)
* [skipJsErrors](#skipjserrors)
* [skipUncaughtErrors](#skipuncaughterrors)
* [filter](#filter)
  * [test](#filtertest)
  * [testGrep](#filtertestgrep)
  * [fixture](#filterfixture)
  * [fixtureGrep](#filterfixturegrep)
  * [testMeta](#filtertestmeta)
  * [fixtureMeta](#filterfixturemeta)
* [appCommand](#appcommand)
* [appInitDelay](#appinitdelay)
* [concurrency](#concurrency)
* [selectorTimeout](#selectortimeout)
* [assertionTimeout](#assertiontimeout)
* [pageLoadTimeout](#pageloadtimeout)
* [speed](#speed)
* [clientScripts](#clientscripts)
* [port1, port2](#port1-port2)
* [hostname](#hostname)
* [proxy](#proxy)
* [proxyBypass](#proxybypass)
* [ssl](#ssl)
* [developmentMode](#developmentmode)
* [qrCode](#qrcode)
* [stopOnFirstFail](#stoponfirstfail)
* [tsConfigPath](#tsconfigpath)
* [disablePageCaching](#disablepagecaching)
* [color](#color)
* [noColor](#nocolor)

The configuration file supports [JSON5 syntax](https://json5.org/). This allows you to use JavaScript identifiers as object keys, single-quoted strings, comments and other JSON5 features.

> You can find a complete configuration file example [in our GitHub repository](https://github.com/DevExpress/testcafe/blob/master/examples/.testcaferc.json).

## browsers

Specifies one or several browsers in which test should be run.

You can use [browser aliases](../guides/concepts/browsers.md#locally-installed-browsers) to specify locally installed browsers.

```json
{
    "browsers": "chrome"
}
```

```json
{
    "browsers": ["ie", "firefox"]
}
```

Use the `all` alias to run tests in all the installed browsers.

To specify a browser by the path to its executable, use the `path:` prefix. Enclose the path in backticks if it contains spaces.

```json
{
    "browsers": "path:`C:\\Program Files\\Internet Explorer\\iexplore.exe`"
}
```

Alternatively, you can pass an object whose `path` property specifies the path to the browser executable. In this case, you can also provide an optional `cmd` property that contains command line parameters passed to the browser.

```json
{
    "browsers": {
        "path": "/home/user/portable/firefox.app",
        "cmd": "--no-remote"
    }
}
```

To run tests in [cloud browsers](../guides/concepts/browsers.md#browsers-in-cloud-testing-services) or [other browsers](../guides/concepts/browsers.md#nonconventional-browsers) accessed through a [browser provider plugin](../extending-testcafe/browser-provider-plugin/README.md),
specify the browser's alias that consists of the `{browser-provider-name}` prefix and the name of a browser (the latter can be omitted); for example, `saucelabs:Chrome@52.0:Windows 8.1`.

```json
{
    "browsers": "saucelabs:Chrome@52.0:Windows 8.1"
}
```

To run tests in a [browser on a remote device](../guides/concepts/browsers.md#browsers-on-remote-devices), specify `remote` as a browser alias.

If you want to connect multiple browsers, specify `remote:` and the number of browsers. For example, if you need to use four remote browsers, specify `remote:4`.

```json
{
    "browsers": "remote:4"
}
```

You can add postfixes to browser aliases to run tests in the [headless mode](../guides/concepts/browsers.md#test-in-headless-mode), use [Chrome device emulation](../guides/concepts/browsers.md#use-chromium-device-emulation) or [user profiles](../guides/concepts/browsers.md#user-profiles).

```json
{
    "browsers": ["firefox:headless", "chrome:emulation:device=iphone X"]
}
```

> You cannot add postfixes when you use the `path:` prefix or pass a `{ path, cmd }` object.

*CLI*: [Browser List](command-line-interface.md#browser-list)  
*API*: [runner.browsers](testcafe-api/runner/browsers.md), [BrowserConnection](testcafe-api/browserconnection/README.md)

## src

Specifies files or directories from which to run tests.

TestCafe can run:

* JavaScript, TypeScript and CoffeeScript files that use TestCafe API,
* [TestCafe Studio](https://www.devexpress.com/products/testcafestudio/) tests (`.testcafe` files),
* Legacy TestCafe v2015.1 tests.

```json
{
    "src": "/home/user/tests/fixture.js"
}
```

```json
{
    "src": ["/home/user/auth-tests/fixture.testcafe", "/home/user/mobile-tests/"]
}
```

You can use [glob patterns](https://github.com/isaacs/node-glob#glob-primer) to specify a set of files.

```json
{
    "src": ["/home/user/tests/**/*.js", "!/home/user/tests/foo.js"]
}
```

*CLI*: [File Path/Glob Pattern](command-line-interface.md#file-pathglob-pattern)  
*API*: [runner.src](testcafe-api/runner/src.md)

## reporter

Specifies the name of a [built-in](../guides/concepts/reporters.md) or [custom reporter](../guides/extend-testcafe/reporter-plugin.md) that should generate test reports.

```json
{
    "reporter": "list"
}
```

This configuration outputs the test report to `stdout`. To save a report to a file, pass an object whose `name` property specifies the reporter name and `output` property specifies the path to the file.

```json
{
    "reporter": {
        "name": "xunit",
        "output": "reports/report.xml"
    }
}
```

You can use multiple reporters, but note that only one reporter can write to `stdout`. All other reporters must output to files.

```json
{
    "reporter": [
        {
            "name": "spec"
        },
        {
            "name": "json",
            "output": "reports/report.json"
        }
    ]
}
```

*CLI*: [-r, --reporter](command-line-interface.md#-r-nameoutput---reporter-nameoutput)  
*API*: [runner.reporter](testcafe-api/runner/reporter.md)

## screenshots

Allows you to specify the screenshot options.

### screenshots.path

Specifies the base directory where screenshots are saved.

```json
{
    "screenshots": {
        "path": "/home/user/tests/screenshots/"
    }
}
```

See [Screenshots](../guides/advanced-guides/screenshots-and-videos.md#screenshots) for details.

*CLI*: [--screenshots path](command-line-interface.md#path)  
*API*: [runner.screenshots](testcafe-api/runner/screenshots.md)

### screenshots.takeOnFails

Specifies that a screenshot should be taken whenever a test fails.

```json
{
    "screenshots": {
        "takeOnFails": true
    }
}
```

Screenshots are saved to the directory specified in the [screenshots.path](#screenshotspath) property.

*CLI*: [--screenshots takeOnFails](command-line-interface.md#takeonfails)  
*API*: [runner.screenshots](testcafe-api/runner/screenshots.md)

### screenshots.pathPattern

Specifies a custom pattern to compose screenshot files' relative path and name.

```json
{
    "screenshots": {
        "pathPattern": "${DATE}_${TIME}/test-${TEST_INDEX}/${USERAGENT}/${FILE_INDEX}.png"
    }
}
```

See [Path Pattern Placeholders](../guides/advanced-guides/screenshots-and-videos.md#path-pattern-placeholders) for information about the available placeholders.

*CLI*: [--screenshots pathPattern](command-line-interface.md#pathpattern)  
*API*: [runner.screenshots](testcafe-api/runner/screenshots.md)

### screenshots.fullPage

Specifies that the full page should be captured, including content that is not visible due to overflow.

```json
{
    "screenshots": {
        "fullPage": true
    }
}
```

*CLI*: [--screenshots fullPage](command-line-interface.md#fullpage)  
*API*: [runner.screenshots](testcafe-api/runner/screenshots.md)

## disableScreenshots

Prevents TestCafe from taking screenshots.

```json
{
    "disableScreenshots": true
}
```

When this property is specified, screenshots are not taken when a test fails or a [screenshot action](test-api/testcontroller/takescreenshot.md) is executed.

*CLI*: [--disable-screenshots](command-line-interface.md#--disable-screenshots)  
*API*: [runner.run({ disableScreenshots })](testcafe-api/runner/run.md)

## screenshotPath

**Obsolete.** Enables screenshots and specifies the base directory where they are saved.

```json
{
    "screenshotPath": "/home/user/tests/screenshots/"
}
```

In **v1.5.0** and newer, screenshots are enabled by default and saved to *./screenshots*.

To save them to a different location, specify the [screenshots.path](#screenshotspath) property:

```json
{
    "screenshots": {
        "path": "/home/user/tests/screenshots/"
    }
}
```

Use the [disableScreenshots](#disablescreenshots) property to prevent TestCafe from taking screenshots:

```json
{
    "disableScreenshots": true
}
```

## takeScreenshotsOnFails

**Obsolete.** Specifies that a screenshot should be taken whenever a test fails.

```json
{
    "takeScreenshotsOnFails": true
}
```

In **v1.5.0** and newer, use the [screenshots.takeOnFails](#screenshotstakeonfails) property:

```json
{
    "screenshots": {
        "takeOnFails": true
    }
}
```

## screenshotPathPattern

**Obsolete.** Specifies a custom pattern to compose screenshot files' relative path and name.

```json
{
    "screenshotPathPattern": "${DATE}_${TIME}/test-${TEST_INDEX}/${USERAGENT}/${FILE_INDEX}.png"
}
```

In **v1.5.0** and newer, use the [screenshots.pathPattern](#screenshotspathpattern) property:

```json
{
    "screenshots": {
        "pathPattern": "${DATE}_${TIME}/test-${TEST_INDEX}/${USERAGENT}/${FILE_INDEX}.png"
    }
}
```

## videoPath

Enables TestCafe to record videos of test runs and specifies the base directory to save these videos.

```json
{
    "videoPath": "reports/screen-captures"
}
```

See [Record Videos](../guides/advanced-guides/screenshots-and-videos.md#record-videos) for details.

*CLI*: [--video](command-line-interface.md#--video-basepath)  
*API*: [runner.video](testcafe-api/runner/video.md)

## videoOptions

Specifies options that define how TestCafe records videos of test runs.

```json
{
    "videoOptions": {
        "singleFile": true,
        "failedOnly": true,
        "pathPattern": "${TEST_INDEX}/${USERAGENT}/${FILE_INDEX}.mp4"
    }
}
```

See [Basic Video Options](../guides/advanced-guides/screenshots-and-videos.md#basic-video-options) for the available options.

> Use the [videoPath](#videopath) option to enable video recording.

*CLI*: [--video-options](command-line-interface.md#--video-options-optionvalueoption2value2)  
*API*: [runner.video](testcafe-api/runner/video.md)

## videoEncodingOptions

Specifies video encoding options.

```json
{
    "videoEncodingOptions": {
        "r": 20,
        "aspect": "4:3"
    }
}
```

You can pass all the options supported by the FFmpeg library. Refer to [the FFmpeg documentation](https://ffmpeg.org/ffmpeg.html#Options) for information about the available options.

> Use the [videoPath](#videopath) option to enable video recording.

*CLI*: [--video-encoding-options](command-line-interface.md#--video-encoding-options-optionvalueoption2value2)  
*API*: [runner.video](testcafe-api/runner/video.md)

## quarantineMode

Enables the [quarantine mode](../guides/basic-guides/run-tests.md#quarantine-mode) for tests that fail.

```json
{
    "quarantineMode": true
}
```

*CLI*: [-q, --quarantine-mode](command-line-interface.md#-q---quarantine-mode)  
*API*: [runner.run({ quarantineMode })](testcafe-api/runner/run.md)

## debugMode

Runs tests in the debugging mode.

```json
{
    "debugMode": true
}
```

See the [--debug-mode](command-line-interface.md#-d---debug-mode) command line parameter for details.

*CLI*: [-d, --debug-mode](command-line-interface.md#-d---debug-mode)  
*API*: [runner.run({ debugMode })](testcafe-api/runner/run.md)

## debugOnFail

Specifies whether to automatically enter the debug mode when a test fails.

```json
{
    "debugOnFail": true
}
```

If this option is enabled, TestCafe pauses the test when it fails. This allows you to view the tested page and determine the cause of the fail.

When you are done, click the **Finish** button in the footer to end test execution.

*CLI*: [--debug-on-fail](command-line-interface.md#--debug-on-fail)  
*API*: [runner.run({ debugOnFail })](testcafe-api/runner/run.md)

## skipJsErrors

Ignores JavaScript errors on a webpage.

```json
{
    "skipJsErrors": true
}
```

When a JavaScript error occurs on a tested web page, TestCafe stops test execution and posts an error message and a stack trace to a report. To ignore JavaScript errors, set the `skipJsErrors` property to `true`.

*CLI*: [-e, --skip-js-errors](command-line-interface.md#-e---skip-js-errors)  
*API*: [runner.run({ skipJsErrors })](testcafe-api/runner/run.md)

## skipUncaughtErrors

Ignores uncaught errors and unhandled promise rejections in test code.

```json
{
    "skipUncaughtErrors": true
}
```

When an uncaught error or unhandled promise rejection occurs on the server during test execution, TestCafe stops the test and posts an error message to a report. To ignore these errors, use the `skipUncaughtErrors` property.

*CLI*: [-u, --skip-uncaught-errors](command-line-interface.md#-u---skip-uncaught-errors)  
*API*: [runner.run({ skipUncaughtErrors })](testcafe-api/runner/run.md)

## filter

Allows you to specify which tests or fixtures to run. Use the following properties individually or in combination.

### filter.test

Runs a test with the specified name.

```json
{
    "filter": {
        "test": "Click a label"
    }
}
```

*CLI*: [-t, --test](command-line-interface.md#-t-name---test-name)  
*API*: [runner.filter](testcafe-api/runner/filter.md)

### filter.testGrep

Runs tests whose names match the specified `grep` pattern.

```json
{
    "filter": {
        "testGrep": "Click.*"
    }
}
```

*CLI*: [-T, --test-grep](command-line-interface.md#-t-pattern---test-grep-pattern)  
*API*: [runner.filter](testcafe-api/runner/filter.md)

### filter.fixture

Runs a fixture with the specified name.

```json
{
    "filter": {
        "fixture": "Sample fixture"
    }
}
```

*CLI*: [-f, --fixture](command-line-interface.md#-f-name---fixture-name)  
*API*: [runner.filter](testcafe-api/runner/filter.md)

### filter.fixtureGrep

Runs tests whose names match the specified `grep` pattern.

```json
{
    "filter": {
        "fixtureGrep": "Page.*"
    }
}
```

*CLI*: [-F, --fixture-grep](command-line-interface.md#-f-pattern---fixture-grep-pattern)  
*API*: [runner.filter](testcafe-api/runner/filter.md)

### filter.testMeta

Runs tests whose [metadata](../guides/basic-guides/organize-tests.md#specify-test-metadata) matches the specified key-value pair.

```json
{
    "filter": {
        "testMeta": {
            "device": "mobile",
            "env": "production"
        }
    }
}
```

This configuration runs tests whose metadata's `device` property is set to `mobile`, and `env` property is set to `production`.

*CLI*: [--test-meta](command-line-interface.md#--test-meta-keyvaluekey2value2)  
*API*: [runner.filter](testcafe-api/runner/filter.md)

### filter.fixtureMeta

Runs tests whose fixture's [metadata](../guides/basic-guides/organize-tests.md#specify-test-metadata) matches the specified key-value pair.

```json
{
    "filter": {
        "fixtureMeta": {
            "device": "mobile",
            "env": "production"
        }
    }
}
```

This configuration runs tests whose fixture's metadata has the `device` property set to `mobile` and the `env` property set to the `production`.

*CLI*: [--fixture-meta](command-line-interface.md#--fixture-meta-keyvaluekey2value2)  
*API*: [runner.filter](testcafe-api/runner/filter.md)

## appCommand

Executes the specified shell command before tests are started.

```json
{
    "appCommand": "node server.js"
}
```

Use the `appCommand` property to launch the application you need to test. This application is automatically terminated after testing is finished.

The [appInitDelay](#appinitdelay) property specifies the amount of time allowed for this command to initialize the tested application.

> TestCafe adds `node_modules/.bin` to `PATH` so that you can use the binaries the locally installed dependencies provide without prefixes.

*CLI*: [-a, --app](command-line-interface.md#-a-command---app-command)  
*API*: [runner.startApp](testcafe-api/runner/startapp.md)

## appInitDelay

Specifies the time (in milliseconds) allowed for an application launched with the [appCommand](#appcommand) option to initialize.

TestCafe waits for the specified time before it starts the tests.

```json
{
    "appCommand": "node server.js",
    "appInitDelay": 3000
}
```

**Default value**: `1000`

*CLI*: [--app-init-delay](command-line-interface.md#--app-init-delay-ms)  
*API*: [runner.startApp](testcafe-api/runner/startapp.md)

## concurrency

Specifies the number of browser instances that should run tests concurrently.

```json
{
    "concurrency": 3
}
```

TestCafe opens several instances of the same browser and creates a pool of browser instances. Tests are run concurrently against this pool, that is, each test is run in the first free instance.

See [Concurrent Test Execution](../guides/basic-guides/run-tests.md#run-tests-concurrently) for more information about concurrent test execution.

*CLI*: [-c, --concurrency](command-line-interface.md#-c-n---concurrency-n)  
*API*: [runner.concurrency](testcafe-api/runner/concurrency.md)

## selectorTimeout

Specifies the time (in milliseconds) within which [selectors](../guides/basic-guides/select-page-elements.md) attempt to obtain a node to be returned. See [Selector Timeout](../guides/basic-guides/select-page-elements.md#selector-timeout) for details.

```json
{
    "selectorTimeout": 3000
}
```

**Default value**: `10000`

*CLI*: [--selector-timeout](command-line-interface.md#--selector-timeout-ms)  
*API*: [runner.run({ selectorTimeout })](testcafe-api/runner/run.md)

## assertionTimeout

Specifies the time (in milliseconds) TestCafe attempts to successfully execute an [assertion](../guides/basic-guides/assert.md)
if a [selector property](../guides/basic-guides/select-page-elements.md#define-assertion-actual-value)
or a [client function](../guides/basic-guides/obtain-client-side-info.md) was passed as an actual value.
See [Smart Assertion Query Mechanism](../guides/basic-guides/assert.md#smart-assertion-query-mechanism).

```json
{
    "assertionTimeout": 1000
}
```

**Default value**: `3000`

*CLI*: [--assertion-timeout](command-line-interface.md#--assertion-timeout-ms)  
*API*: [runner.run({ assertionTimeout })](testcafe-api/runner/run.md)

## pageLoadTimeout

Specifies the time (in milliseconds) passed after the `DOMContentLoaded` event, within which TestCafe waits for the `window.load` event to fire.

After the timeout passes or the `window.load` event is raised (whichever happens first), TestCafe starts the test.

```json
{
    "pageLoadTimeout": 1000
}
```

**Default value**: `3000`

See the command line [--page-load-timeout](command-line-interface.md#--page-load-timeout-ms) parameter for details.

*CLI*: [--page-load-timeout](command-line-interface.md#--page-load-timeout-ms)  
*API*: [runner.run({ pageLoadTimeout })](testcafe-api/runner/run.md)

## speed

Specifies the test execution speed.

Tests are run at the maximum speed by default. You can use this option
to slow the test down.

Provide a number between `1` (the fastest) and `0.01` (the slowest).

```json
{
    "speed": 0.1
}
```

**Default value**: `1`

If the speed is also specified for an individual action, the action's speed setting overrides the test speed.

*CLI*: [--speed](command-line-interface.md#--speed-factor)  
*API*: [runner.run({ speed })](testcafe-api/runner/run.md)

## clientScripts

Injects scripts into pages visited during the tests. Use this property to introduce client-side mock functions or helper scripts.

```json
{
    "clientScripts": [
        {
            "module": "lodash"
        },
        {
            "path": "scripts/react-helpers.js",
            "page": "https://myapp.com/page/"
        }
    ]
}
```

### Inject a JavaScript File

{% capture syntax %}

```text
{
    "clientScripts": "<filePath>" | { "path": "<filePath>" }
}
{
    "clientScripts": [ "<filePath>" | { "path": "<filePath>" } ]
}
```

{% endcapture %}
{% include client-scripts/inject-javascript-file.md syntax=syntax relativePaths="cwd" %}
**Example**

```js
{
    "clientScripts": "assets/jquery.js",
    // or
    "clientScripts": { "path": "assets/jquery.js" }
}
```

### Inject a Module

{% capture syntax %}

```text
{
    "clientScripts": { "module": "<moduleName>" }
}
{
    "clientScripts": [ { "module": "<moduleName>" } ]
}
```

{% endcapture %}
{% include client-scripts/inject-module.md syntax=syntax %}
**Example**

```js
{
    "clientScripts": {
        "module": "lodash"
    }
}
```

### Inject Script Code

{% capture syntax %}

```text
{
    "clientScripts": { "content": "<code>" }
}
{
    "clientScripts": [ { "content": "<code>" } ]
}
```

{% endcapture %}
{% include client-scripts/inject-code.md syntax=syntax %}
**Example**

```json
{
    "clientScripts": {
        "content": "Date.prototype.getTime = () => 42;"
    }
}
```

### Provide Scripts for Specific Pages

{% capture syntax %}

```text
{
    "clientScripts": {
        "page": "<url>",
        "path": "<filePath>" | "module": "<moduleName>" | "content": "<code>"
    }
}
{
    "clientScripts": [
        {
            "page": "<url>",
            "path": "<filePath>" | "module": "<moduleName>" | "content": "<code>"
        }
    ]
}
```

{% endcapture %}
{% include client-scripts/specify-pages.md syntax=syntax regexp=false %}
**Example**

```json
{
    "clientScripts": {
        "page": "https://myapp.com/page/",
        "content": "Geolocation.prototype.getCurrentPosition = () => new Positon(0, 0);"
    }
}
```

> Note that regular expressions are not supported in the configuration file. Use the [runner.clientScripts](testcafe-api/runner/clientscripts.md) method or test API methods for [fixtures](test-api/fixture/clientscripts.md) and [tests](test-api/test/clientscripts.md) to [define target pages](../guides/advanced-guides/inject-client-scripts.md#provide-scripts-for-specific-pages) with a regular expression.

The [fixture.clientScripts](test-api/fixture/clientscripts.md) and [test.clientScripts](test-api/test/clientscripts.md) methods allow you to inject scripts into pages visited during an individual fixture or test.

For more information, see [Inject Scripts into Tested Pages](../guides/advanced-guides/inject-client-scripts.md).

*CLI*: [--cs, --client-scripts](command-line-interface.md#--cs-pathpath2---client-scripts-pathpath2)  
*API*: [runner.clientScripts](testcafe-api/runner/clientscripts.md)

## port1, port2

Specifies custom port numbers TestCafe uses to perform testing. The number range is [0-65535].

```json
{
    "port1": 12345,
    "port2": 54321
}
```

TestCafe automatically selects ports if ports are not specified.

*CLI*: [--ports](command-line-interface.md#--ports-port1port2)  
*API*: [createTestCafe](testcafe-api/global/createtestcafe.md)

## hostname

Specifies your computer's hostname. It is used when you run tests in remote browsers.

```json
{
    "hostname": "host.mycorp.com"
}
```

If the hostname is not specified, TestCafe uses the operating system's hostname or the current machine's network IP address.

*CLI*: [--hostname](command-line-interface.md#--hostname-name)  
*API*: [createTestCafe](testcafe-api/global/createtestcafe.md)

## proxy

Specifies the proxy server used in your local network to access the Internet.

```json
{
    "proxy": "proxy.corp.mycompany.com"
}
```

```json
{
    "proxy": "172.0.10.10:8080"
}
```

You can also specify authentication credentials with the proxy host.

```json
{
    "proxy": "username:password@proxy.mycorp.com"
}
```

*CLI*: [--proxy](command-line-interface.md#--proxy-host)  
*API*: [runner.useProxy](testcafe-api/runner/useproxy.md)

## proxyBypass

Requires that TestCafe bypasses the proxy server to access the specified resources.

```json
{
    "proxyBypass": "*.mycompany.com"
}
```

```json
{
    "proxyBypass": ["localhost:8080", "internal-resource.corp.mycompany.com"]
}
```

See the [--proxy-bypass](command-line-interface.md#--proxy-bypass-rules) command line parameter for details.

*CLI*: [--proxy-bypass](command-line-interface.md#--proxy-bypass-rules)  
*API*: [runner.useProxy](testcafe-api/runner/useproxy.md)

## ssl

Provides options that allow you to establish an HTTPS connection between the client browser and the TestCafe server.

```json
{
    "ssl": {
        "pfx": "path/to/file.pfx",
        "rejectUnauthorized": true
    }
}
```

See the [--ssl](command-line-interface.md#--ssl-options) command line parameter for details.

*CLI*: [--ssl](command-line-interface.md#--ssl-options)  
*API*: [createTestCafe](testcafe-api/global/createtestcafe.md)

## developmentMode

Enables mechanisms to log and diagnose errors. You should enable this option if you plan to contact TestCafe Support to report an issue.

```json
{
    "developmentMode": true
}
```

*CLI*: [--dev](command-line-interface.md#--dev)  
*API*: [createTestCafe](testcafe-api/global/createtestcafe.md)

## qrCode

If you launch TestCafe from the console, this option outputs a QR-code that represents URLs used to connect the remote browsers.

```json
{
    "qrCode": true
}
```

*CLI*: [--qr-code](command-line-interface.md#--qr-code)  

## stopOnFirstFail

Stops a test run if any test fails.

```json
{
    "stopOnFirstFail": true
}
```

*CLI*: [--sf, --stop-on-first-fail](command-line-interface.md#--sf---stop-on-first-fail)  
*API*: [runner.run({ stopOnFirstFail })](testcafe-api/runner/run.md)

## tsConfigPath

Enables TestCafe to use a custom [TypeScript configuration file](../guides/concepts/typescript-and-coffeescript.md#customize-compiler-options) and specifies its location.

```json
{
    "tsConfigPath": "/Users/s.johnson/testcafe/tsconfig.json"
}
```

You can specify an absolute or relative path. Relative paths are resolved against the current directory (the directory from which you run TestCafe).

*CLI*: [--ts-config-path](command-line-interface.md#--ts-config-path-path)  
*API*: [runner.tsConfigPath](testcafe-api/runner/tsconfigpath.md)

## disablePageCaching

Prevents the browser from caching page content.

```json
{
    "disablePageCaching": true
}
```

When navigation to a cached page occurs in [role code](../guides/advanced-guides/authentication.md#user-roles), local and session storage content is not preserved. Set `disablePageCaching` to `true` to retain the storage items after navigation. For more information, see [Troubleshooting: Test Actions Fail After Authentication](../guides/advanced-guides/authentication.md#test-actions-fail-after-authentication).

You can also disable page caching for an individual [fixture](test-api/fixture/disablepagecaching.md) or [test](test-api/test/disablepagecaching.md).

*CLI*: [--disable-page-caching](command-line-interface.md#--disable-page-caching)  
*API*: [runner.run({ disablePageCaching })](testcafe-api/runner/run.md)

## color

Enables colors in the command line.

```json
{
    "color": true
}
```

*CLI*: [--color](command-line-interface.md#--color)

## noColor

Disables colors in the command line.

```json
{
    "noColor": true
}
```

*CLI*: [--no-color](command-line-interface.md#--no-color)
