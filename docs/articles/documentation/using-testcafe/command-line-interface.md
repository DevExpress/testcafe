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
  * [--ports \<port1,port2\>](#--ports-port1port2)
  * [--hostname \<name\>](#--hostname-name)
  * [--speed \<factor\>](#--speed-factor)
  * [--qr-code](#--qr-code)
  * [--color](#--color)
  * [--no-color](#--no-color)

> Important! Make sure to keep the browser tab that is running tests active. Do not minimize the browser window.
> Inactive tabs and minimized browser windows switch to a lower resource consumption mode
> where tests are not guaranteed to execute correctly.

## Browser List

The `browser-list-comma-separated` argument specifies the list of browsers (separated by commas) where tests will be run.

> You are free to specify different types of browsers in one command call.

### Local Browsers

You can specify [locally installed browsers](common-concepts/browsers/browser-support.md#locally-installed-browsers) by using browser aliases or paths (with the `path:` prefix).
The list of all the available browsers can be obtained by calling the [--list-browsers](#-b---list-browsers) command.

The following example demonstrates how to run a test in several browsers.
The browsers are specified differently: one by using an alias, the other by using a path.

```sh
testcafe chrome,path:/applications/safari.app tests/sample-fixture.js
```

To run tests against **all installed browsers**, use the `all` alias.

```sh
testcafe all tests/sample-fixture.js
```

### Portable Browsers

You can specify [portable browsers](common-concepts/browsers/browser-support.md#portable-browsers) by using paths to the browser's executable file (with the `path:` prefix), for example:

```sh
testcafe path:d:\firefoxportable\firefoxportable.exe tests/sample-fixture.js
```

If the path contains spaces, surround it with backticks and additionally surround the whole parameter including the keyword in quotation marks.

On Windows `cmd.exe`, the default command prompt, use double quotation marks.

```sh
testcafe "path:`C:\Program Files (x86)\Firefox Portable\firefox.exe`" tests/sample-fixture.js
```

On `Unix` shells like `bash`, `zsh`, `csh` (on macOS, Linux, Windows Subsystem for Linux) and Windows PowerShell, prefer single quotation marks.

```sh
testcafe 'path:`C:\Program Files (x86)\Firefox Portable\firefox.exe`' tests/sample-fixture.js
```

### Testing in Headless Mode

To run tests in the headless mode in Google Chrome or Firefox, use the `:headless` postfix:

```sh
testcafe "firefox:headless" tests/sample-fixture.js
```

For details, see [Testing in Headless Mode](common-concepts/browsers/testing-in-headless-mode.md).

### Using Chrome Device Emulation

To run tests in Chrome device emulation mode, specify `:emulation` and [device parameters](common-concepts/browsers/using-chrome-device-emulation.md#emulator-parameters).

```sh
testcafe "chrome:emulation:device=iphone 6" tests/sample-fixture.js
```

To learn more, see [Using Chrome Device Emulation](common-concepts/browsers/using-chrome-device-emulation.md)

### Remote Browsers

To run tests in a [browser on a remote device](common-concepts/browsers/browser-support.md#browsers-on-remote-devices), specify `remote` as a browser alias.

```sh
testcafe remote tests/sample-fixture.js
```

If you want to connect multiple browsers, specify `remote:` and the number of browsers. For example, if you need to use three remote browsers, specify `remote:3`.

```sh
testcafe remote:3 tests/sample-fixture.js
```

TestCafe will provide URLs to open in required browsers on your remote device.

> If you run tests [concurrently](#-c-n---concurrency-n),
> specify the total number of instances of all browsers after the `remote:` keyword.

You can also use the [--qr-code](#--qr-code) option to display QR-codes that represent the same URLs.
Scan the QR-codes by using the device on which you are going to test your application.
As a result, the browsers will be connected to TestCafe and tests will start.

### Browsers Accessed Through Browser Provider Plugins

To run tests in [cloud browsers](common-concepts/browsers/browser-support.md#browsers-in-cloud-testing-services) or [other browsers](common-concepts/browsers/browser-support.md#nonconventional-browsers) accessed through a [browser provider plugin](../extending-testcafe/browser-provider-plugin/README.md),
specify a browser alias that consists of the `{browser-provider-name}` prefix and the name of a browser itself (the latter can be omitted); for example, `saucelabs:Chrome@52.0:Windows 8.1`.

```sh
testcafe "saucelabs:Chrome@52.0:Windows 8.1" tests/sample-fixture.js
```

### Starting browser with arguments

If you need to pass arguments for the specified browser, write them right after browser alias. Surround the browser call and its arguments with quotation marks.

On Windows `cmd.exe`, the default command prompt, use double quotation marks.

```sh
testcafe "chrome --start-fullscreen" tests/sample-fixture.js
```

On `Unix` shells like `bash`, `zsh`, `csh` (on macOS, Linux, Windows Subsystem for Linux) and Windows PowerShell, prefer single quotation marks.

```sh
testcafe 'chrome --start-fullscreen' tests/sample-fixture.js
```

You can also specify arguments for portable browsers. If a path to a browser contains spaces, the path should be surrounded with backticks.

For Unix shells and Windows PowerShell:

```sh
testcafe 'path:`/Users/TestCafe/Apps/Google Chrome.app` --start-fullscreen' tests/sample-fixture.js
```

For `cmd.exe`:

```sh
testcafe "path:`C:\Program Files (x86)\Google\Chrome\Application\chrome.exe` --start-fullscreen" tests/sample-fixture.js
```

You can specify arguments for local browsers only.

## File Path/Glob Pattern

The `file-or-glob ...` argument specifies the files or directories (separated by a space) from which to run these tests.

For example, this command runs all tests located in the `my-tests` directory.

```sh
testcafe ie my-tests
```

The following command runs tests from the specified fixture files.

```sh
testcafe ie my-tests/fixture1.js my-tests/fixture2.js
```

You can also use [globbing patterns](https://github.com/isaacs/node-glob#glob-primer) to specify a set of files.
For example, this command runs tests from files that match `tests/*page*`, namely `tests/example-page.js` and `tests/main-page.js`.

```sh
testcafe ie tests/*page*
```

If you do not specify any file or directory, TestCafe will run tests from the `test` or `tests` directories.

## Options

### -h, --help

Displays usage information for commands.

```sh
testcafe --help
```

### -v, --version

Displays the TestCafe version.

```sh
testcafe --version
```

### -b, --list-browsers

Lists aliases of the [local browsers](common-concepts/browsers/browser-support.md#locally-installed-browsers) available on your computer.

```sh
testcafe --list-browsers
```

### -r \<name\[:file\],\[...\]\>, --reporter \<name\[:file\],\[...\]\>

Specifies the name of a [built-in](common-concepts/reporters.md) or [custom reporter](../extending-testcafe/reporter-plugin/README.md) that will be used to generate test reports.

The following command runs tests in all available browsers and generates a report in the xunit format.

```sh
testcafe all tests/sample-fixture.js -r xunit
```

The following command runs tests and generates a test report by using the custom reporter plugin.

```sh
testcafe all tests/sample-fixture.js -r my-reporter
```

The generated test report will be displayed in the command prompt window.

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

Enables screenshot capturing and specifies the directory path
to save screenshots to.

```sh
testcafe all tests/sample-fixture.js -s screenshots
```

### -S, --screenshots-on-fails

Takes a screenshot whenever a test fails. Screenshots are saved to the directory
specified by using the **-screenshots \<path\>** option.

For example, the following command runs tests from the
  `sample-fixture.js` file in all browsers, takes screenshots if tests fail,
  and saves the screenshots to the `screenshots` directory.

```sh
testcafe all tests/sample-fixture.js -S -s screenshots
```

### -q, --quarantine-mode

Enables the quarantine mode for tests that fail.
In this mode, a failed test is executed several more times.
The test result depends on the outcome (*passed* or *failed*) that occurs most often.
That is, if the test fails on most attempts, the result is *failed*.
And vice versa, if the test is executed successfully on most of the attempts, the result is *passed*.

If the test result differs between test runs, the test is marked as unstable.

```sh
testcafe all tests/sample-fixture.js -q
```

### -e, --skip-js-errors

Prevents tests from failure when a JavaScript error occurs on a tested web page.
By default, in case of such errors, TestCafe stops test execution and posts
an error message to a report. If you want TestCafe to ignore JavaScript errors,
specify this argument.

For example, the following command runs tests from the specified file and forces TestCafe to ignore JavaScript errors.

```sh
testcafe ie tests/sample-fixture.js -e
```

### -c \<n\>, --concurrency \<n\>

Specifies that tests should run concurrently.

TestCafe will open `n` instances of the same browser thus creating a pool of browser instances.
Tests will run concurrently against this pool, i.e. each test will run in the first free instance.

To learn more about concurrent test execution, see [Concurrent Test Execution](common-concepts/concurrent-test-execution.md).

The following example shows how to run tests in three Chrome instances.

```sh
testcafe -c 3 chrome tests/sample-fixture.js
```

### -t \<name\>, --test \<name\>

TestCafe will run a test with the specified name.

For example, the following command runs only the `"Click a label"` test from the `sample-fixture.js` file.

```sh
testcafe ie tests/sample-fixture.js -t "Click a label"
```

### -T \<pattern\>, --test-grep \<pattern\>

TestCafe will run tests whose names match the specified pattern.

For example, the following command runs tests whose names match `Click.*`. These can be the `Click a label`, `Click a button` tests, etc.

```sh
testcafe ie my-tests -T "Click.*"
```

### -f \<name\>, --fixture \<name\>

TestCafe will run a fixture with the specified name.

```sh
testcafe ie my-tests -f sample-fixture
```

### -F \<pattern\>, --fixture-grep \<pattern\>

TestCafe will run fixtures whose names match the specified pattern.

For example, the following command runs fixtures whose names match `Page.*`. These can be the `Page1`, `Page2` fixtures, etc.

```sh
testcafe ie my-tests -F "Page.*"
```

### -a \<command\>, --app \<command\>

Executes the specified shell command before running tests. Use it to launch or deploy the application you are going to test.

After testing is finished, this application will be automatically terminated.

```sh
testcafe chrome my-tests --app "node server.js"
```

> TestCafe adds `node_modules/.bin` to `PATH` so that you can use binaries provided by locally installed dependencies without prefixes.

Use the [--app-init-delay](#--app-init-delay-ms) option to specify the amount of time allowed for this command to initialize the tested application.

### -d, --debug-mode

Specify this option to run tests in the debugging mode. In this mode, test execution is paused before the first action or assertion allowing you to invoke the developer tools and debug.

In the footer, a status bar is displayed in which you can resume test execution or step to the next action or assertion.

![Debugging status bar](../../images/debugging/client-debugging-footer.png)

> If the test you run in the debugging mode contains a [test hook](../test-api/test-code-structure.md#test-hooks),
> it will be paused within this hook before the first action.

You can also use the **Unlock page** switch in the footer to unlock the tested page and interact with its elements.

### --debug-on-fail

Specifies whether to automatically enter the [debug mode](#-d---debug-mode) when a test fails.

If this option is enabled, TestCafe pauses the test at the moment it fails. This allows you to explore the tested page and determine the cause of the fail.

When you are done, click the **Finish** button in the footer to end test execution.

### --app-init-delay \<ms\>

Specifies the amount of time, in milliseconds, allowed for an application launched using the [--app](#-a-command---app-command) option to initialize.

TestCafe waits for the specified time before it starts running tests.

**Default value**: `1000`

```sh
testcafe chrome my-tests --app "node server.js" --app-init-delay 4000
```

### --selector-timeout \<ms\>

Specifies the amount of time, in milliseconds, within which [selectors](../test-api/selecting-page-elements/selectors/README.md) make
attempts to obtain a node to be returned. See [Selector Timeout](../test-api/selecting-page-elements/selectors/using-selectors.md#selector-timeout).

**Default value**: `10000`

```sh
testcafe ie my-tests --selector-timeout 500000
```

### --assertion-timeout \<ms\>

Specifies the amount of time, in milliseconds, within which TestCafe makes attempts to successfully execute an [assertion](../test-api/assertions/README.md)
if a [selector property](../test-api/selecting-page-elements/selectors/using-selectors.md#define-assertion-actual-value)
or a [client function](../test-api/obtaining-data-from-the-client/README.md) was passed as an actual value.
See [Smart Assertion Query Mechanism](../test-api/assertions/README.md#smart-assertion-query-mechanism).

**Default value**: `3000`

```sh
testcafe ie my-tests --assertion-timeout 10000
```

### --page-load-timeout \<ms\>

Specifies the amount of time, in milliseconds, passed after the `DOMContentLoaded` event, within which TestCafe waits for the `window.load` event to fire.

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

### --ports \<port1,port2\>

Specifies custom port numbers used by TestCafe to perform testing. The number range is [0-65535].

If ports are not specified, TestCafe selects ports.

### --hostname \<name\>

Specifies the hostname of your computer. It is used when running tests in [remote browsers](#remote-browsers).

If the hostname is not specified, TestCafe will use the operating system hostname or network IP address of the current machine.

### --speed \<factor\>

Specifies the speed of test execution.

By default, tests run at the maximum speed. However, if you need to watch a test running
to understand what happens in it, this speed may seem too fast. In this instance, use this option
to slow the test down.

`factor` should be a number between `1` (the fastest) and `0.01` (the slowest).

```sh
testcafe chrome my-tests --speed 0.1
```

If speed is also specified for an [individual action](../test-api/actions/action-options.md#basic-action-options), the action speed setting overrides test speed.

**Default value**: `1`

### --qr-code

Outputs QR-code that represents URLs used to connect the [remote browsers](#remote-browsers).

```sh
testcafe remote my-tests --qr-code
```

### --color

Enables colors on the command line.

### --no-color

Disables colors on the command line.
