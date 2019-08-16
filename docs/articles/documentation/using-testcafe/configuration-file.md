---
layout: docs
title: Configuration File
permalink: /documentation/using-testcafe/configuration-file.html
---
# Configuration File

TestCafe uses the `.testcaferc.json` configuration file to store its settings.

> Important! Settings you specify when you run TestCafe from the [command line](command-line-interface.md) and [programming interfaces](programming-interface/README.md) override settings from `.testcaferc.json`. TestCafe prints information about every overridden property in the console.

Keep `.testcaferc.json` in the directory from which you run TestCafe. This is usually the project's root directory. TestCafe does not take into account configuration files located in other directories (for instance, project's subdirectories).

A configuration file can include the following settings:

* [browsers](#browsers)
* [src](#src)
* [reporter](#reporter)
* [screenshotPath](#screenshotpath)
* [takeScreenshotsOnFails](#takescreenshotsonfails)
* [screenshotPathPattern](#screenshotpathpattern)
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

You can use [browser aliases](common-concepts/browsers/browser-support.md#locally-installed-browsers) to specify locally installed browsers.

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

To run tests in [cloud browsers](common-concepts/browsers/browser-support.md#browsers-in-cloud-testing-services) or [other browsers](common-concepts/browsers/browser-support.md#nonconventional-browsers) accessed through a [browser provider plugin](../extending-testcafe/browser-provider-plugin/README.md),
specify the browser's alias that consists of the `{browser-provider-name}` prefix and the name of a browser (the latter can be omitted); for example, `saucelabs:Chrome@52.0:Windows 8.1`.

```json
{
    "browsers": "saucelabs:Chrome@52.0:Windows 8.1"
}
```

To run tests in a [browser on a remote device](common-concepts/browsers/browser-support.md#browsers-on-remote-devices), specify `remote` as a browser alias.

If you want to connect multiple browsers, specify `remote:` and the number of browsers. For example, if you need to use four remote browsers, specify `remote:4`.

```json
{
    "browsers": "remote:4"
}
```

You can add postfixes to browser aliases to run tests in the [headless mode](common-concepts/browsers/testing-in-headless-mode.md), use [Chrome device emulation](common-concepts/browsers/using-chrome-device-emulation.md) or [user profiles](common-concepts/browsers/user-profiles.md).

```json
{
    "browsers": ["firefox:headless", "chrome:emulation:device=iphone X"]
}
```

> You cannot add postfixes when you use the `path:` prefix or pass a `{ path, cmd }` object.

*CLI*: [Browser List](command-line-interface.md#browser-list)  
*API*: [runner.browsers](programming-interface/runner.md#browsers), [BrowserConnection](programming-interface/browserconnection.md)

## src

Specifies files or directories from which to run tests.

TestCafe can run:

* JavaScript, TypeScript and CoffeeScript files that use [TestCafe API](../test-api/README.md),
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

You can use [globbing patterns](https://github.com/isaacs/node-glob#glob-primer) to specify a set of files.

```json
{
    "src": ["/home/user/tests/**/*.js", "!/home/user/tests/foo.js"]
}
```

*CLI*: [File Path/Glob Pattern](command-line-interface.md#file-pathglob-pattern)  
*API*: [runner.src](programming-interface/runner.md#src)

## reporter

Specifies the name of a [built-in](common-concepts/reporters.md) or [custom reporter](../extending-testcafe/reporter-plugin/README.md) that should generate test reports.

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
*API*: [runner.reporter](programming-interface/runner.md#reporter)

## screenshotPath

Enables screenshots and specifies the base directory where they are saved.

```json
{
    "screenshotPath": "/home/user/tests/screenshots/"
}
```

See [Screenshots](common-concepts/screenshots-and-videos.md#screenshots) for details.

*CLI*: [-s, --screenshots](command-line-interface.md#-s-path---screenshots-path)  
*API*: [runner.screenshots](programming-interface/runner.md#screenshots)

## takeScreenshotsOnFails

Specifies that a screenshot should be taken whenever a test fails.

```json
{
    "takeScreenshotsOnFails": true
}
```

Screenshots are saved to the directory specified in the [screenshotPath](#screenshotpath) option.

*CLI*: [-S, --screenshots-on-fails](command-line-interface.md#-s---screenshots-on-fails)  
*API*: [runner.screenshots](programming-interface/runner.md#screenshots)

## screenshotPathPattern

Specifies a custom pattern to compose screenshot files' relative path and name.

```json
{
    "screenshotPathPattern": "${DATE}_${TIME}/test-${TEST_INDEX}/${USERAGENT}/${FILE_INDEX}.png"
}
```

See [Path Pattern Placeholders](common-concepts/screenshots-and-videos.md#path-pattern-placeholders) for information about the available placeholders.

> Use the [screenshotPath](#screenshotpath) option to enable screenshots.

*CLI*: [-p, --screenshot-path-pattern](command-line-interface.md#-p-pattern---screenshot-path-pattern-pattern)  
*API*: [runner.screenshots](programming-interface/runner.md#screenshots)

## videoPath

Enables TestCafe to record videos of test runs and specifies the base directory to save these videos.

```json
{
    "videoPath": "reports/screen-captures"
}
```

See [Record Videos](common-concepts/screenshots-and-videos.md#record-videos) for details.

*CLI*: [--video](command-line-interface.md#--video-basepath)  
*API*: [runner.video](programming-interface/runner.md#video)

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

See [Basic Video Options](common-concepts/screenshots-and-videos.md#basic-video-options) for the available options.

> Use the [videoPath](#videopath) option to enable video recording.

*CLI*: [--video-options](command-line-interface.md#--video-options-optionvalueoption2value2)  
*API*: [runner.video](programming-interface/runner.md#video)

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
*API*: [runner.video](programming-interface/runner.md#video)

## quarantineMode

Enables the [quarantine mode](programming-interface/runner.md#quarantine-mode) for tests that fail.

```json
{
    "quarantineMode": true
}
```

*CLI*: [-q, --quarantine-mode](command-line-interface.md#-q---quarantine-mode)  
*API*: [runner.run({ quarantineMode })](programming-interface/runner.md#run)

## debugMode

Runs tests in the debugging mode.

```json
{
    "debugMode": true
}
```

See the [--debug-mode](command-line-interface.md#-d---debug-mode) command line parameter for details.

*CLI*: [-d, --debug-mode](command-line-interface.md#-d---debug-mode)  
*API*: [runner.run({ debugMode })](programming-interface/runner.md#run)

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
*API*: [runner.run({ debugOnFail })](programming-interface/runner.md#run)

## skipJsErrors

Ignores JavaScript errors on a webpage.

```json
{
    "skipJsErrors": true
}
```

When a JavaScript error occurs on a tested web page, TestCafe stops test execution and posts an error message and a stack trace to a report. To ignore JavaScript errors, set the `skipJsErrors` property to `true`.

*CLI*: [-e, --skip-js-errors](command-line-interface.md#-e---skip-js-errors)  
*API*: [runner.run({ skipJsErrors })](programming-interface/runner.md#run)

## skipUncaughtErrors

Ignores uncaught errors and unhandled promise rejections in test code.

```json
{
    "skipUncaughtErrors": true
}
```

When an uncaught error or unhandled promise rejection occurs on the server during test execution, TestCafe stops the test and posts an error message to a report. To ignore these errors, use the `skipUncaughtErrors` property.

*CLI*: [-u, --skip-uncaught-errors](command-line-interface.md#-u---skip-uncaught-errors)  
*API*: [runner.run({ skipUncaughtErrors })](programming-interface/runner.md#run)

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
*API*: [runner.filter](programming-interface/runner.md#filter)

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
*API*: [runner.filter](programming-interface/runner.md#filter)

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
*API*: [runner.filter](programming-interface/runner.md#filter)

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
*API*: [runner.filter](programming-interface/runner.md#filter)

### filter.testMeta

Runs tests whose [metadata](../test-api/test-code-structure.md#specifying-testing-metadata) [matches](https://lodash.com/docs/#isMatch) the specified key-value pair.

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
*API*: [runner.filter](programming-interface/runner.md#filter)

### filter.fixtureMeta

Runs tests whose fixture's [metadata](../test-api/test-code-structure.md#specifying-testing-metadata) [matches](https://lodash.com/docs/#isMatch) the specified key-value pair.

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
*API*: [runner.filter](programming-interface/runner.md#filter)

## appCommand

Executes the specified shell command before running tests.

```json
{
    "appCommand": "node server.js"
}
```

Use the `appCommand` property to launch the application you are going to test. This application is automatically terminated after testing is finished.

The [appInitDelay](#appinitdelay) property specifies the amount of time allowed for this command to initialize the tested application.

> TestCafe adds `node_modules/.bin` to `PATH` so that you can use the binaries the locally installed dependencies provide without prefixes.

*CLI*: [-a, --app](command-line-interface.md#-a-command---app-command)  
*API*: [runner.startApp](programming-interface/runner.md#startapp)

## appInitDelay

Specifies the time (in milliseconds) allowed for an application launched using the [appCommand](#appcommand) option to initialize.

TestCafe waits for the specified time before it starts running tests.

```json
{
    "appCommand": "node server.js",
    "appInitDelay": 3000
}
```

**Default value**: `1000`

*CLI*: [--app-init-delay](command-line-interface.md#--app-init-delay-ms)  
*API*: [runner.startApp](programming-interface/runner.md#startapp)

## concurrency

Specifies the number of browser instances that should run tests concurrently.

```json
{
    "concurrency": 3
}
```

TestCafe opens several instances of the same browser and creates a pool of browser instances. Tests are run concurrently against this pool, that is, each test is run in the first free instance.

See [Concurrent Test Execution](common-concepts/concurrent-test-execution.md) for more information about concurrent test execution.

*CLI*: [-c, --concurrency](command-line-interface.md#-c-n---concurrency-n)  
*API*: [runner.concurrency](programming-interface/runner.md#concurrency)

## selectorTimeout

Specifies the time (in milliseconds) within which [selectors](../test-api/selecting-page-elements/selectors/README.md) attempt to obtain a node to be returned. See [Selector Timeout](../test-api/selecting-page-elements/selectors/using-selectors.md#selector-timeout) for details.

```json
{
    "selectorTimeout": 3000
}
```

**Default value**: `10000`

*CLI*: [--selector-timeout](command-line-interface.md#--selector-timeout-ms)  
*API*: [runner.run({ selectorTimeout })](programming-interface/runner.md#run)

## assertionTimeout

Specifies the time (in milliseconds) TestCafe attempts to successfully execute an [assertion](../test-api/assertions/README.md)
if a [selector property](../test-api/selecting-page-elements/selectors/using-selectors.md#define-assertion-actual-value)
or a [client function](../test-api/obtaining-data-from-the-client/README.md) was passed as an actual value.
See [Smart Assertion Query Mechanism](../test-api/assertions/README.md#smart-assertion-query-mechanism).

```json
{
    "assertionTimeout": 1000
}
```

**Default value**: `3000`

*CLI*: [--assertion-timeout](command-line-interface.md#--assertion-timeout-ms)  
*API*: [runner.run({ assertionTimeout })](programming-interface/runner.md#run)

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
*API*: [runner.run({ pageLoadTimeout })](programming-interface/runner.md#run)

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

If the speed is also specified for an [individual action](../test-api/actions/action-options.md#basic-action-options), the action's speed setting overrides the test speed.

*CLI*: [--speed](command-line-interface.md#--speed-factor)  
*API*: [runner.run({ speed })](programming-interface/runner.md#run)

## clientScripts

Injects scripts into pages visited during the tests. Use this property to introduce client-side mock functions or helper scripts.

```json
{
    "clientScripts": "assets/jquery.js"
}
```

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

> Relative paths resolve from the current working directory.

See [Provide Scripts to Inject](common-concepts/inject-scripts-into-tested-pages.md#provide-scripts-to-inject) to learn how to specify the scripts.

You can use the [page](common-concepts/inject-scripts-into-tested-pages.md#provide-scripts-for-specific-pages) option to specify pages into which scripts should be injected. Otherwise, TestCafe injects scripts into all pages visited during the test run.

> Note that regular expressions are not supported in the configuration file. Use the [runner.clientScripts](programming-interface/runner.md#clientscripts) method or [test API methods](../test-api/test-code-structure.md#inject-scripts-into-tested-pages) to [define target pages](common-concepts/inject-scripts-into-tested-pages.md#provide-scripts-for-specific-pages) with a regular expression.

The [fixture.clientScripts](../test-api/test-code-structure.md#inject-scripts-into-tested-pages) and [test.clientScripts](../test-api/test-code-structure.md#inject-scripts-into-tested-pages) methods allow you to inject scripts into pages visited during an individual fixture or test.

For more information, see [Inject Scripts into Tested Pages](common-concepts/inject-scripts-into-tested-pages.md).

*CLI*: [--cs, --client-scripts](command-line-interface.md#--cs-pathpath2---client-scripts-pathpath2)  
*API*: [runner.clientScripts](programming-interface/runner.md#clientscripts)

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
*API*: [createTestCafe](programming-interface/createtestcafe.md)

## hostname

Specifies your computer's hostname. It is used when you run tests in remote browsers.

```json
{
    "hostname": "host.mycorp.com"
}
```

If the hostname is not specified, TestCafe uses the operating system's hostname or the current machine's network IP address.

*CLI*: [--hostname](command-line-interface.md#--hostname-name)  
*API*: [createTestCafe](programming-interface/createtestcafe.md)

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
*API*: [runner.useProxy](programming-interface/runner.md#useproxy)

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
*API*: [runner.useProxy](programming-interface/runner.md#useproxy)

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
*API*: [createTestCafe](programming-interface/createtestcafe.md)

## developmentMode

Enables mechanisms to log and diagnose errors. You should enable this option if you are going to contact TestCafe Support to report an issue.

```json
{
    "developmentMode": true
}
```

*CLI*: [--dev](command-line-interface.md#--dev)  
*API*: [createTestCafe](programming-interface/createtestcafe.md)

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
*API*: [runner.run({ stopOnFirstFail })](programming-interface/runner.md#run)

## tsConfigPath

Enables TestCafe to use a custom [TypeScript configuration file](../test-api/typescript-support.md#customize-compiler-options) and specifies its location.

```json
{
    "tsConfigPath": "/Users/s.johnson/testcafe/tsconfig.json"
}
```

You can specify an absolute or relative path. Relative paths resolve from the current directory (the directory from which you run TestCafe).

*CLI*: [--ts-config-path](command-line-interface.md#--ts-config-path-path)  
*API*: [runner.tsConfigPath](programming-interface/runner.md#tsconfigpath)

## disablePageCaching

Prevents the browser from caching the page content.

```json
{
    "disablePageCaching": true
}
```

When navigation to a cached page occurs in [role code](../test-api/authentication/user-roles.md), local and session storage content is not preserved. Set `disablePageCaching` to `true` to retain the storage items after navigation. For more information, see [Troubleshooting: Test Actions Fail After Authentication](../test-api/authentication/user-roles.md#test-actions-fail-after-authentication).

You can also disable page caching [for an individual fixture or test](../test-api/test-code-structure.md#disable-page-caching).

*CLI*: [--disable-page-caching](command-line-interface.md#--disable-page-caching)  
*API*: [runner.run({ disablePageCaching })](programming-interface/runner.md#run)

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
