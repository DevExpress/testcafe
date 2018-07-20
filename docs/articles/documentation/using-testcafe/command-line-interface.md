---
layout: docs
title: Command Line Interface
permalink: /documentation/using-testcafe/command-line-interface.html
checked: true
---
# Command Line Interface

```sh
testcafe [options] <browser-list-comma-separated> <file-or-glob ...>
```

* [Browser List](#browser-list)
  * [Local Browsers](#local-browsers)
  * [Portable Browsers](#portable-browsers)
  * [Testing in Headless Mode](#testing-in-headless-mode)
  * [Using Chrome Device Emulation](#using-chrome-device-emulation)
  * [Remote Browsers](#remote-browsers)
  * [Browsers Accessed Through Browser Provider Plugins](#browsers-accessed-through-browser-provider-plugins)
  * [Starting browser with arguments](#starting-browser-with-arguments)
* [File Path/Glob Pattern](#file-pathglob-pattern)
* [Options](#options)
  * [-h, --help](#-h---help)
  * [-v, --version](#-v---version)
  * [-b, --list-browsers](#-b---list-browsers)
  * [-r \<name\[:file\],\[...\]\>, --reporter \<name\[:file\],\[...\]\>](#-r-namefile---reporter-namefile)
  * [-s \<path\>, --screenshots \<path\>](#-s-path---screenshots-path)
  * [-S, --screenshots-on-fails](#-s---screenshots-on-fails)
  * [-p, --screenshot-path-pattern](#-p---screenshot-path-pattern)
  * [-q, --quarantine-mode](#-q---quarantine-mode)
  * [-e, --skip-js-errors](#-e---skip-js-errors)
  * [-c \<n\>, --concurrency \<n\>](#-c-n---concurrency-n)
  * [-t \<name\>, --test \<name\>](#-t-name---test-name)
  * [-T \<pattern\>, --test-grep \<pattern\>](#-t-pattern---test-grep-pattern)
  * [-f \<name\>, --fixture \<name\>](#-f-name---fixture-name)
  * [-F \<pattern\>, --fixture-grep \<pattern\>](#-f-pattern---fixture-grep-pattern)
  * [-a \<command\>, --app \<command\>](#-a-command---app-command)
  * [-d, --debug-mode](#-d---debug-mode)
  * [--debug-on-fail](#--debug-on-fail)
  * [--app-init-delay \<ms\>](#--app-init-delay-ms)
  * [--selector-timeout \<ms\>](#--selector-timeout-ms)
  * [--assertion-timeout \<ms\>](#--assertion-timeout-ms)
  * [--page-load-timeout \<ms\>](#--page-load-timeout-ms)
  * [--proxy \<host\>](#--proxy-host)
  * [--proxy-bypass \<rules\>](#--proxy-bypass-rules)
  * [--ports \<port1,port2\>](#--ports-port1port2)
  * [--hostname \<name\>](#--hostname-name)
  * [--ssl \<options\>](#--ssl-options)
  * [--speed \<factor\>](#--speed-factor)
  * [--dev](#--dev)
  * [--qr-code](#--qr-code)
  * [--color](#--color)
  * [--no-color](#--no-color)

> Important! Make sure to keep the browser tab that is running tests active. Do not minimize the browser window.
> Inactive tabs and minimized browser windows switch to a lower resource consumption mode
> where tests do not always execute correctly.

## Browser List

The `browser-list-comma-separated` argument specifies the list of browsers (separated by commas) where tests are run.

> You can specify different browser types in one command call.

### Local Browsers

You can specify [locally installed browsers](common-concepts/browsers/browser-support.md#locally-installed-browsers) using browser aliases or paths (with the `path:` prefix).
Use the [--list-browsers](#-b---list-browsers) command to output aliases for automatically detected browsers.

The following example demonstrates how to run a test in several browsers.
The browsers are specified differently: one using an alias, the other using a path.

```sh
testcafe chrome,path:/applications/safari.app tests/sample-fixture.js
```

Use the `all` alias to run tests in **all the installed browsers**.

```sh
testcafe all tests/sample-fixture.js
```

### Portable Browsers

You can specify [portable browsers](common-concepts/browsers/browser-support.md#portable-browsers) using paths to the browser's executable file (with the `path:` prefix), for example:

```sh
testcafe path:d:\firefoxportable\firefoxportable.exe tests/sample-fixture.js
```

If the path contains spaces, enclose it in backticks and additionally surround the whole parameter including the keyword in quotation marks.

In Windows `cmd.exe` (default command prompt), use double quotation marks:

```sh
testcafe "path:`C:\Program Files (x86)\Firefox Portable\firefox.exe`" tests/sample-fixture.js
```

In `Unix` shells like `bash`, `zsh`, `csh` (macOS, Linux, Windows Subsystem for Linux) and Windows PowerShell, use single quotation marks:

```sh
testcafe 'path:`C:\Program Files (x86)\Firefox Portable\firefox.exe`' tests/sample-fixture.js
```

### Testing in Headless Mode

To run tests in the headless mode in Google Chrome or Firefox, use the `:headless` postfix:

```sh
testcafe "firefox:headless" tests/sample-fixture.js
```

See [Testing in Headless Mode](common-concepts/browsers/testing-in-headless-mode.md) for more information.

### Using Chrome Device Emulation

To run tests in Chrome's device emulation mode, specify `:emulation` and [device parameters](common-concepts/browsers/using-chrome-device-emulation.md#emulator-parameters).

```sh
testcafe "chrome:emulation:device=iphone 6" tests/sample-fixture.js
```

See [Using Chrome Device Emulation](common-concepts/browsers/using-chrome-device-emulation.md) for more details.

### Remote Browsers

To run tests in a [browser on a remote device](common-concepts/browsers/browser-support.md#browsers-on-remote-devices), specify `remote` as a browser alias.

```sh
testcafe remote tests/sample-fixture.js
```

If you want to connect multiple browsers, specify `remote:` and the number of browsers. For example, if you need to use three remote browsers, specify `remote:3`.

```sh
testcafe remote:3 tests/sample-fixture.js
```

TestCafe provides URLs you should open in your remote device's browsers.

> If you run tests [concurrently](#-c-n---concurrency-n),
> specify the total number of all browsers' instances after the `remote:` keyword.

You can also use the [--qr-code](#--qr-code) option to display QR-codes that represent the same URLs.
Scan the QR-codes using the device on which you are going to test your application.
This connects the browsers to TestCafe and starts the tests.

### Browsers Accessed Through Browser Provider Plugins

To run tests in [cloud browsers](common-concepts/browsers/browser-support.md#browsers-in-cloud-testing-services) or [other browsers](common-concepts/browsers/browser-support.md#nonconventional-browsers) accessed through a [browser provider plugin](../extending-testcafe/browser-provider-plugin/README.md),
specify the browser's alias that consists of the `{browser-provider-name}` prefix and the name of a browser (the latter can be omitted); for example, `saucelabs:Chrome@52.0:Windows 8.1`.

```sh
testcafe "saucelabs:Chrome@52.0:Windows 8.1" tests/sample-fixture.js
```

### Starting browser with arguments

If you need to pass arguments for the specified browser, write them after the browser's alias. Enclose the browser call and its arguments in quotation marks.

In Windows `cmd.exe` (default command prompt), use double quotation marks:

```sh
testcafe "chrome --start-fullscreen" tests/sample-fixture.js
```

In `Unix` shells like `bash`, `zsh`, `csh` (macOS, Linux, Windows Subsystem for Linux) and Windows PowerShell, use single quotation marks:

```sh
testcafe 'chrome --start-fullscreen' tests/sample-fixture.js
```

You can also specify arguments for portable browsers. If a path to a browser contains spaces, the path should be enclosed in backticks.

For Unix shells and Windows PowerShell:

```sh
testcafe 'path:`/Users/TestCafe/Apps/Google Chrome.app` --start-fullscreen' tests/sample-fixture.js
```

For `cmd.exe`:

```sh
testcafe "path:`C:\Program Files (x86)\Google\Chrome\Application\chrome.exe` --start-fullscreen" tests/sample-fixture.js
```

Only installed and portable browsers located on the current machine can be launched with arguments.

## File Path/Glob Pattern

The `file-or-glob ...` argument specifies the files or directories (separated by a space) from which to run these tests.

For example, this command runs all tests in the `my-tests` directory:

```sh
testcafe ie my-tests
```

The following command runs tests from the specified fixture files:

```sh
testcafe ie my-tests/fixture1.js my-tests/fixture2.js
```

You can also use [globbing patterns](https://github.com/isaacs/node-glob#glob-primer) to specify a set of files.
For example, this command runs tests from files that match `tests/*page*`, namely `tests/example-page.js` and `tests/main-page.js`.

```sh
testcafe ie tests/*page*
```

If you do not specify any file or directory, TestCafe runs tests from the `test` or `tests` directories.

## Options

### -h, --help

Displays commands' usage information.

```sh
testcafe --help
```

### -v, --version

Displays the TestCafe version.

```sh
testcafe --version
```

### -b, --list-browsers

Lists the aliases of the [auto-detected browsers](common-concepts/browsers/browser-support.md#locally-installed-browsers) installed on the local machine.

```sh
testcafe --list-browsers
```

### -r \<name\[:file\],\[...\]\>, --reporter \<name\[:file\],\[...\]\>

Specifies the name of a [built-in](common-concepts/reporters.md) or [custom reporter](../extending-testcafe/reporter-plugin/README.md) that is used to generate test reports.

The following command runs tests in all available browsers and generates a report in xunit format:

```sh
testcafe all tests/sample-fixture.js -r xunit
```

The following command runs tests and generates a test report by using the custom reporter plugin:

```sh
testcafe all tests/sample-fixture.js -r my-reporter
```

The generated test report is displayed in the command prompt window.

If you need to save the report to an external file, specify the file path after the report name.

```sh
testcafe all tests/sample-fixture.js -r json:report.json
```

You can also use multiple reporters in a single test run. List them separated by commas.

```sh
testcafe all tests/sample-fixture.js -r spec,xunit:report.xml
```

Note that only one reporter can write to `stdout`. All other reporters must output to files.

### -s \<path\>, --screenshots \<path\>

Enables screenshot capturing and specifies the root directory where screenshots are saved.

```sh
testcafe all tests/sample-fixture.js -s screenshots
```

#### Path Patterns

The captured screenshots are organized into subdirectories within the root directory. The screenshots' relative path and name are defined using the default screenshot path patterns:

* `${DATE}_${TIME}\test-${TEST_INDEX}\${USERAGENT}\{$FILE_INDEX}.png` if the [quarantine mode](#-q---quarantine-mode) is disabled;
* `${DATE}_${TIME}\test-${TEST_INDEX}\run-${QUARANTINE_ATTEMPT}\${USERAGENT}\{$FILE_INDEX}.png` if the [quarantine mode](#-q---quarantine-mode) is enabled.
* `${DATE}_${TIME}\test-${TEST_INDEX}\${USERAGENT}\errors\{$FILE_INDEX}.png` if the [--screenshots-on-fails](#-s---screenshots-on-fails) option is specified.
* `${DATE}_${TIME}\test-${TEST_INDEX}\run-${QUARANTINE_ATTEMPT}\${USERAGENT}\errors\{$FILE_INDEX}.png` if the [quarantine mode](#-q---quarantine-mode) and [--screenshots-on-fails](#-s---screenshots-on-fails) option are enabled.

You can also specify a custom pattern using the [--screenshot-path-pattern](#-p---screenshot-path-pattern) option.

### -S, --screenshots-on-fails

Takes a screenshot whenever a test fails. Screenshots are saved to the directory specified in the **-screenshots \<path\>** option.

For example, the following command runs tests from the
  `sample-fixture.js` file in all browsers, takes screenshots if tests fail,
  and saves the screenshots to the `screenshots` directory:

```sh
testcafe all tests/sample-fixture.js -S -s screenshots
```

### -p, --screenshot-path-pattern

Specifies a custom pattern to compose screenshot files' relative path and name. This pattern overrides the default [path pattern](#path-patterns).

You can use the following placeholders in the pattern:

Placeholder | Description
----------- | -----------
`${DATE}` | The test run's start date (YYYY-MM-DD).
`${TIME}` | The test run's start time (HH-mm-ss).
`${TEST_INDEX}` | The test's index.
`${FILE_INDEX}` | The screenshot file's index.
`${QUARANTINE_ATTEMPT}` | The [quarantine](programming-interface/runner.md#quarantine-mode) attempt's number. If the quarantine mode is disabled, the `${QUARANTINE_ATTEMPT}` placeholder's value is 1.
`${FIXTURE}` | The fixture's name.
`${TEST}` | The test's name.
`${USERAGENT}` | The combination of `${BROWSER}`, `${BROWSER_VERSION}`, `${OS}`, and `${OS_VERSION}`.
`${BROWSER}` | The browser's name.
`${BROWSER_VERSION}` | The browser's version.
`${OS}` | The operation system's name.
`${OS_VERSION}` | The operation system's version.

```sh
testcafe all tests/sample-fixture.js -s screenshots -p "${DATE}_${TIME}/test-${TEST_INDEX}/${USERAGENT}/${FILE_INDEX}.png"
```

### -q, --quarantine-mode

Enables the [quarantine mode](programming-interface/runner.md#quarantine-mode) for tests that fail.

```sh
testcafe all tests/sample-fixture.js -q
```

### -e, --skip-js-errors

When a JavaScript error occurs on a tested web page, TestCafe stops test execution and posts an error message to a report. To ignore JavaScript errors, use the `-e`(`--skip-js-errors`) option.

For example, the following command runs tests from the specified file and forces TestCafe to ignore JavaScript errors:

```sh
testcafe ie tests/sample-fixture.js -e
```

### -c \<n\>, --concurrency \<n\>

Specifies that tests should run concurrently.

TestCafe opens `n` instances of the same browser and creates a pool of browser instances.
Tests are run concurrently against this pool, that is, each test is run in the first free instance.

See [Concurrent Test Execution](common-concepts/concurrent-test-execution.md) for more information about concurrent test execution.

The following example shows how to run tests in three Chrome instances:

```sh
testcafe -c 3 chrome tests/sample-fixture.js
```

### -t \<name\>, --test \<name\>

TestCafe runs a test with the specified name.

For example, the following command runs only the `"Click a label"` test from the `sample-fixture.js` file:

```sh
testcafe ie tests/sample-fixture.js -t "Click a label"
```

### -T \<pattern\>, --test-grep \<pattern\>

TestCafe runs tests whose names match the specified pattern.

For example, the following command runs tests whose names match `Click.*`. These can be `Click a label`, `Click a button`, etc.

```sh
testcafe ie my-tests -T "Click.*"
```

### -f \<name\>, --fixture \<name\>

TestCafe runs a fixture with the specified name.

```sh
testcafe ie my-tests -f sample-fixture
```

### -F \<pattern\>, --fixture-grep \<pattern\>

TestCafe runs fixtures whose names match the specified pattern.

For example, the following command runs fixtures whose names match `Page.*`. These can be `Page1`, `Page2`, etc.

```sh
testcafe ie my-tests -F "Page.*"
```

### -a \<command\>, --app \<command\>

Executes the specified shell command before running tests. Use it to launch or deploy the application you are going to test.

An application is automatically terminated after testing is finished.

```sh
testcafe chrome my-tests --app "node server.js"
```

> TestCafe adds `node_modules/.bin` to `PATH` so that you can use the binaries the locally installed dependencies provide without prefixes.

Use the [--app-init-delay](#--app-init-delay-ms) option to specify the amount of time allowed for this command to initialize the tested application.

### -d, --debug-mode

Specify this option to run tests in the debugging mode. In this mode, test execution is paused before the first action or assertion allowing you to invoke the developer tools and debug.

The footer displays a status bar in which you can resume test execution or skip to the next action or assertion.

![Debugging status bar](../../images/debugging/client-debugging-footer.png)

> If the test you run in the debugging mode contains a [test hook](../test-api/test-code-structure.md#test-hooks),
> it is paused within this hook before the first action.

You can also use the **Unlock page** switch in the footer to unlock the tested page and interact with its elements.

### --debug-on-fail

Specifies whether to automatically enter the [debug mode](#-d---debug-mode) when a test fails.

If this option is enabled, TestCafe pauses the test when it fails. This allows you to view the tested page and determine the cause of the fail.

When you are done, click the **Finish** button in the footer to end test execution.

### --app-init-delay \<ms\>

Specifies the time (in milliseconds) allowed for an application launched using the [--app](#-a-command---app-command) option to initialize.

TestCafe waits for the specified time before it starts running tests.

**Default value**: `1000`

```sh
testcafe chrome my-tests --app "node server.js" --app-init-delay 4000
```

### --selector-timeout \<ms\>

Specifies the time (in milliseconds) within which [selectors](../test-api/selecting-page-elements/selectors/README.md) attempt to obtain a node to be returned. See [Selector Timeout](../test-api/selecting-page-elements/selectors/using-selectors.md#selector-timeout).

**Default value**: `10000`

```sh
testcafe ie my-tests --selector-timeout 500000
```

### --assertion-timeout \<ms\>

Specifies the time (in milliseconds) TestCafe attempts to successfully execute an [assertion](../test-api/assertions/README.md)
if a [selector property](../test-api/selecting-page-elements/selectors/using-selectors.md#define-assertion-actual-value)
or a [client function](../test-api/obtaining-data-from-the-client/README.md) was passed as an actual value.
See [Smart Assertion Query Mechanism](../test-api/assertions/README.md#smart-assertion-query-mechanism).

**Default value**: `3000`

```sh
testcafe ie my-tests --assertion-timeout 10000
```

### --page-load-timeout \<ms\>

Specifies the time (in milliseconds) passed after the `DOMContentLoaded` event, within which TestCafe waits for the `window.load` event to fire.

After the timeout passes or the `window.load` event is raised (whichever happens first), TestCafe starts the test.

> Note that the `DOMContentLoaded` event is raised after the HTML document is loaded and parsed, while `window.load` is raised after all stylesheets, images and subframes are loaded. That is why `window.load` is fired after the `DOMContentLoaded` event with a certain delay.

**Default value**: `3000`

You can set the page load timeout to `0` to skip waiting for the `window.load` event.

```sh
testcafe ie my-tests --page-load-timeout 0
```

### --proxy \<host\>

Specifies the proxy server used in your local network to access the Internet.

```sh
testcafe chrome my-tests/**/*.js --proxy proxy.corp.mycompany.com
```

```sh
testcafe chrome my-tests/**/*.js --proxy 172.0.10.10:8080
```

You can also specify authentication credentials with the proxy host.

```js
testcafe chrome my-tests/**/*.js --proxy username:password@proxy.mycorp.com
```

### --proxy-bypass \<rules\>

Specifies the resources accessed bypassing the proxy server.

When you access the Internet through a proxy server specified using the [--proxy](#--proxy-host) option, you may still need some local or external resources to be accessed directly. In this instance, provide their URLs to the `--proxy-bypass` option.

The `rules` parameter takes a comma-separated list (without spaces) of URLs that require direct access. You can replace parts of the URL with the `*` wildcard that matches any number of characters. Wildcards at the beginning and end of the rules can be omitted (`*.mycompany.com` and `.mycompany.com` have the same effect).

The following example uses the proxy server at `proxy.corp.mycompany.com` with the `localhost:8080` address accessed directly:

```sh
testcafe chrome my-tests/**/*.js --proxy proxy.corp.mycompany.com --proxy-bypass localhost:8080
```

In the example below, two resources are accessed by bypassing the proxy: `localhost:8080` and `internal-resource.corp.mycompany.com`.

```sh
testcafe chrome my-tests/**/*.js --proxy proxy.corp.mycompany.com --proxy-bypass localhost:8080,internal-resource.corp.mycompany.com
```

The `*.mycompany.com` value means that all URLs in the `mycompany.com` subdomains are accessed directly.

```sh
testcafe chrome my-tests/**/*.js --proxy proxy.corp.mycompany.com --proxy-bypass *.mycompany.com
```

### --ports \<port1,port2\>

Specifies custom port numbers TestCafe uses to perform testing. The number range is [0-65535].

TestCafe automatically selects ports if ports are not specified.

### --hostname \<name\>

Specifies your computer's hostname. It is used when running tests in [remote browsers](#remote-browsers).

If the hostname is not specified, TestCafe uses the operating system hostname or network IP address of the current machine.

### --ssl \<options\>

Provides options that allow you to establish HTTPS connection between the client browser and the TestCafe server.

The `options` parameter contains options required to initialize
[a Node.js HTTPS server](https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener).
The most commonly used SSL options are described in the [TLS topic](https://nodejs.org/api/tls.html#tls_tls_createsecurecontext_options) in Node.js documentation.
Options are specified in a semicolon-separated string.

```sh
testcafe --ssl pfx=path/to/file.pfx;rejectUnauthorized=true;...
```

Provide the `--ssl` flag if the tested webpage uses browser features that require
secure origin ([Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API), [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API), [ApplePaySession](https://developer.apple.com/documentation/apple_pay_on_the_web/applepaysession), [SubtleCrypto](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto), etc).
See [Connect to the TestCafe Server over HTTPS](common-concepts/connect-to-the-testcafe-server-over-https.md) for more information.

### --speed \<factor\>

Specifies the test execution speed.

Tests are run at the maximum speed by default. You can use this option
to slow the test down.

`factor` should be a number between `1` (the fastest) and `0.01` (the slowest).

```sh
testcafe chrome my-tests --speed 0.1
```

If the speed is also specified for an [individual action](../test-api/actions/action-options.md#basic-action-options), the action's speed setting overrides the test speed.

**Default value**: `1`

### --dev

Enables mechanisms to log and diagnose errors. You should enable this option if you are going to contact TestCafe Support to report an issue.

```sh
testcafe chrome my-tests --dev
```

### --qr-code

Outputs a QR-code that represents URLs used to connect the [remote browsers](#remote-browsers).

```sh
testcafe remote my-tests --qr-code
```

### --color

Enables colors in the command line.

### --no-color

Disables colors in the command line.
