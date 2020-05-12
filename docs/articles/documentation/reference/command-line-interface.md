---
layout: docs
title: Command Line Interface
permalink: /documentation/reference/command-line-interface.html
redirect_from:
  - /documentation/using-testcafe/command-line-interface.html
---
# Command Line Interface

```sh
testcafe [options] <browser-list-comma-separated> <file-or-glob ...>
```

* [Browser List](#browser-list)
  * [Local Browsers](#local-browsers)
  * [Portable Browsers](#portable-browsers)
  * [Test in Headless Mode](#test-in-headless-mode)
  * [Use Chrome Device Emulation](#use-chrome-device-emulation)
  * [Remote Browsers](#remote-browsers)
  * [Browsers Accessed Through Browser Provider Plugins](#browsers-accessed-through-browser-provider-plugins)
  * [Start a Browser With Arguments](#start-a-browser-with-arguments)
* [File Path/Glob Pattern](#file-pathglob-pattern)
* [Options](#options)
  * [-h, --help](#-h---help)
  * [-v, --version](#-v---version)
  * [-b, --list-browsers](#-b---list-browsers)
  * [-r \<name\[:output\],\[...\]\>, --reporter \<name\[:output\],\[...\]\>](#-r-nameoutput---reporter-nameoutput)
  * [-s, --screenshots \<option=value\[,option2=value2,...\]\>](#-s---screenshots-optionvalueoption2value2)
    * [path](#path)
    * [takeOnFails](#takeonfails)
    * [pathPattern](#pathpattern)
    * [fullPage](#fullpage)
  * [--disable-screenshots](#--disable-screenshots)
  * [-s \<path\>, --screenshots \<path\>](#-s-path---screenshots-path) *(obsolete)*
  * [-S, --screenshots-on-fails](#-s---screenshots-on-fails) *(obsolete)*
  * [-p \<pattern\>, --screenshot-path-pattern \<pattern\>](#-p-pattern---screenshot-path-pattern-pattern) *(obsolete)*
  * [--video \<basePath\>](#--video-basepath)
  * [--video-options \<option=value\[,option2=value2,...\]\>](#--video-options-optionvalueoption2value2)
  * [--video-encoding-options \<option=value\[,option2=value2,...\]\>](#--video-encoding-options-optionvalueoption2value2)
  * [-q, --quarantine-mode](#-q---quarantine-mode)
  * [-d, --debug-mode](#-d---debug-mode)
  * [--debug-on-fail](#--debug-on-fail)
  * [-e, --skip-js-errors](#-e---skip-js-errors)
  * [-u, --skip-uncaught-errors](#-u---skip-uncaught-errors)
  * [-t \<name\>, --test \<name\>](#-t-name---test-name)
  * [-T \<pattern\>, --test-grep \<pattern\>](#-t-pattern---test-grep-pattern)
  * [-f \<name\>, --fixture \<name\>](#-f-name---fixture-name)
  * [-F \<pattern\>, --fixture-grep \<pattern\>](#-f-pattern---fixture-grep-pattern)
  * [--test-meta \<key=value\[,key2=value2,...\]\>](#--test-meta-keyvaluekey2value2)
  * [--fixture-meta \<key=value\[,key2=value2,...\]\>](#--fixture-meta-keyvaluekey2value2)
  * [-a \<command\>, --app \<command\>](#-a-command---app-command)
  * [--app-init-delay \<ms\>](#--app-init-delay-ms)
  * [-c \<n\>, --concurrency \<n\>](#-c-n---concurrency-n)
  * [--selector-timeout \<ms\>](#--selector-timeout-ms)
  * [--assertion-timeout \<ms\>](#--assertion-timeout-ms)
  * [--page-load-timeout \<ms\>](#--page-load-timeout-ms)
  * [--speed \<factor\>](#--speed-factor)
  * [--cs \<path\[,path2,...\]\>, --client-scripts \<path\[,path2,...\]\>](#--cs-pathpath2---client-scripts-pathpath2)
  * [--ports \<port1,port2\>](#--ports-port1port2)
  * [--hostname \<name\>](#--hostname-name)
  * [--proxy \<host\>](#--proxy-host)
  * [--proxy-bypass \<rules\>](#--proxy-bypass-rules)
  * [--ssl \<options\>](#--ssl-options)
  * [-L, --live](#-l---live)
  * [--dev](#--dev)
  * [--qr-code](#--qr-code)
  * [--sf, --stop-on-first-fail](#--sf---stop-on-first-fail)
  * [--ts-config-path \<path\>](#--ts-config-path-path)
  * [--disable-page-caching](#--disable-page-caching)
  * [--color](#--color)
  * [--no-color](#--no-color)

When you execute the `testcafe` command, TestCafe first reads settings from the `.testcaferc.json` [configuration file](configuration-file.md) if this file exists, and then applies the settings from the command line. Command line settings override values from the configuration file in case they differ. TestCafe prints information about every overridden property in the console.

If the [browsers](configuration-file.md#browsers) and [src](configuration-file.md#src) properties are specified in the configuration file, you can omit them in the command line.

> Important! Make sure to keep the browser tab that is running tests active. Do not minimize the browser window.
> Inactive tabs and minimized browser windows switch to a lower resource consumption mode
> where tests do not always execute correctly.

If a browser stops responding while it executes tests, TestCafe restarts the browser and reruns the current test in a new browser instance.
If the same problem occurs with this test two more times, the test run finishes and an error is thrown.

## Browser List

The `browser-list-comma-separated` argument specifies the list of browsers (separated by commas) where tests are run.

*Related configuration file property*: [browsers](configuration-file.md#browsers).

### Local Browsers

You can use browser aliases or paths to executable files to specify [locally installed browsers](../guides/concepts/browsers.md#locally-installed-browsers). The [--list-browsers](#-b---list-browsers) command prints aliases for all automatically detected browsers.

The following example demonstrates how to run a test in two browsers: one browser is specified with an alias, the other browser is identified with a path.

```sh
testcafe chrome,path:/applications/safari.app tests/sample-fixture.js
```

Use the `all` alias to run tests in **all the installed browsers**.

```sh
testcafe all tests/sample-fixture.js
```

### Portable Browsers

You can use a path to the browser's executable file (with the `path:` prefix) to specify [portable browsers](../guides/concepts/browsers.md#portable-browsers), for example:

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

> Do not use the `path:` prefix if you need to run a browser in the [headless mode](../guides/concepts/browsers.md#test-in-headless-mode), use [device emulation](../guides/concepts/browsers.md#use-chromium-device-emulation) or [user profiles](../guides/concepts/browsers.md#user-profiles). Specify the [browser alias](../guides/concepts/browsers.md#locally-installed-browsers) in these cases.

### Test in Headless Mode

To run tests in the headless mode in Google Chrome or Firefox, use the `:headless` postfix:

```sh
testcafe "firefox:headless" tests/sample-fixture.js
```

See [Test in Headless Mode](../guides/concepts/browsers.md#test-in-headless-mode) for more information.

### Use Chrome Device Emulation

To run tests in Chrome's device emulation mode, specify `:emulation` and [device parameters](../guides/concepts/browsers.md#emulator-parameters).

```sh
testcafe "chrome:emulation:device=iphone X" tests/sample-fixture.js
```

See [Use Chrome Device Emulation](../guides/concepts/browsers.md#use-chromium-device-emulation) for more details.

### Remote Browsers

To run tests in a [browser on a remote device](../guides/concepts/browsers.md#browsers-on-remote-devices), specify `remote` as a browser alias.

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
Scan the QR-codes with the device on which you wish to test your application.
This connects the browsers to TestCafe and starts the tests.

### Browsers Accessed Through Browser Provider Plugins

To run tests in [cloud browsers](../guides/concepts/browsers.md#browsers-in-cloud-testing-services) or [other browsers](../guides/concepts/browsers.md#nonconventional-browsers) accessed through a [browser provider plugin](../extending-testcafe/browser-provider-plugin/README.md),
specify the browser's alias that consists of the `{browser-provider-name}` prefix and the name of a browser (the latter can be omitted); for example, `saucelabs:Chrome@52.0:Windows 8.1`.

```sh
testcafe "saucelabs:Chrome@52.0:Windows 8.1" tests/sample-fixture.js
```

### Start a Browser With Arguments

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

The `file-or-glob ...` argument specifies the files or directories (separated by a space) from which to run the tests.

TestCafe can run:

* JavaScript, TypeScript and CoffeeScript files that use TestCafe API,
* [TestCafe Studio](https://www.devexpress.com/products/testcafestudio/) tests (`.testcafe` files),
* Legacy TestCafe v2015.1 tests.

*Related configuration file property*: [src](configuration-file.md#src).

For example, this command runs all tests in the `my-tests` directory:

```sh
testcafe ie my-tests
```

The following command runs tests from the specified fixture files:

```sh
testcafe ie js-tests/fixture.js studio-tests/fixture.testcafe
```

You can also use [glob patterns](https://github.com/isaacs/node-glob#glob-primer) to specify a set of files.

The following command runs tests from files that match the `tests/*page*` pattern (for instance, `tests/example-page.js`, `tests/main-page.js`, or `tests/auth-page.testcafe`):

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

Lists the aliases of the [auto-detected browsers](../guides/concepts/browsers.md#locally-installed-browsers) installed on the local machine.

```sh
testcafe --list-browsers
```

### -r \<name\[:output\],\[...\]\>, --reporter \<name\[:output\],\[...\]\>

Specifies the name of a [built-in](../guides/concepts/reporters.md) or [custom reporter](../extending-testcafe/reporter-plugin/README.md) that is used to generate test reports.

The following command runs tests in all available browsers and generates a report in xunit format:

```sh
testcafe all tests/sample-fixture.js -r xunit
```

The following command runs tests and specifies a custom reporter plugin that generates a test report:

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

*Related configuration file property*: [reporter](configuration-file.md#reporter).

### -s, --screenshots \<option=value\[,option2=value2,...\]\>

Specifies screenshot options.

```sh
testcafe all tests/sample-fixture.js -s path=artifacts/screenshots,takeOnFails=true
```

#### path

Specifies the base directory where screenshots are saved.

```sh
testcafe all tests/sample-fixture.js -s path=artifacts/screenshots
```

See [Screenshots](../guides/advanced-guides/screenshots-and-videos.md#screenshots) for details.

*Related configuration file property*: [screenshots.path](configuration-file.md#screenshotspath).

#### takeOnFails

Takes a screenshot whenever a test fails.

```sh
testcafe all tests/sample-fixture.js -s takeOnFails=true
```

TestCafe saves screenshots to the directory specified in the [path](#path) parameter.

*Related configuration file property*: [screenshots.takeOnFails](configuration-file.md#screenshotstakeonfails).

#### pathPattern

Specifies a custom pattern to compose screenshot files' relative path and name.

```sh
testcafe all tests/sample-fixture.js -s pathPattern=${DATE}_${TIME}/test-${TEST_INDEX}/${USERAGENT}/${FILE_INDEX}.png
```

See [Path Pattern Placeholders](../guides/advanced-guides/screenshots-and-videos.md#path-pattern-placeholders) for information about the available placeholders.

Enclose the pattern in quotes if it contains spaces:

```sh
testcafe all tests/sample-fixture.js -s pathPattern='${DATE} ${TIME}/test ${TEST_INDEX}/${USERAGENT}/${FILE_INDEX}.png'
```

In Windows `cmd.exe` shell, use double quotes:

```sh
testcafe all tests/sample-fixture.js -s pathPattern="${DATE} ${TIME}/test ${TEST_INDEX}/${USERAGENT}/${FILE_INDEX}.png"
```

*Related configuration file property*: [screenshots.pathPattern](configuration-file.md#screenshotspathpattern).

#### fullPage

Specifies that the full page should be captured, including content that is not visible due to overflow.

```sh
testcafe all tests/sample-fixture.js -s fullPage=true
```

*Related configuration file property*: [screenshots.fullPage](configuration-file.md#screenshotsfullpage).

### --disable-screenshots

Prevents TestCafe from taking screenshots.

```sh
testcafe all tests/sample-fixture.js --disable-screenshots
```

When this option is specified, screenshots are not taken whenever a test fails or a when [t.takeScreenshot](test-api/testcontroller/takescreenshot.md) or [t.takeElementScreenshot](test-api/testcontroller/takeelementscreenshot.md) is executed.

*Related configuration file property*: [disableScreenshots](configuration-file.md#disablescreenshots).

### -s \<path\>, --screenshots \<path\>

**Obsolete.** Enables screenshots and specifies the base directory where they are saved.

```sh
testcafe all tests/sample-fixture.js -s screenshots
```

In **v1.5.0** and newer, screenshots are enabled by default and saved to *./screenshots*.

To specify a different location, pass the [path](#path) parameter:

```sh
testcafe all tests/sample-fixture.js -s path=screenshots
```

Use the [--disable-screenshots](#--disable-screenshots) option to prevent TestCafe from taking screenshots:

```sh
testcafe all tests/sample-fixture.js --disable-screenshots
```

### -S, --screenshots-on-fails

**Obsolete.** Takes a screenshot whenever a test fails.

```sh
testcafe all tests/sample-fixture.js -S -s screenshots
```

In **v1.5.0** and newer, use the [takeOnFails](#takeonfails) parameter:

```sh
testcafe all tests/sample-fixture.js -s takeOnFails=true
```

### -p \<pattern\>, --screenshot-path-pattern \<pattern\>

**Obsolete.** Specifies a custom pattern to compose screenshot files' relative path and name.

```sh
testcafe all tests/sample-fixture.js -s screenshots -p '${DATE}_${TIME}/test-${TEST_INDEX}/${USERAGENT}/${FILE_INDEX}.png'
```

In **v1.5.0** and newer, use the [pathPattern](#pathpattern) parameter:

```sh
testcafe all tests/sample-fixture.js -s pathPattern=${DATE}_${TIME}/test-${TEST_INDEX}/${USERAGENT}/${FILE_INDEX}.png
```

### --video \<basePath\>

Enables TestCafe to record videos of test runs and specifies the base directory to save these videos.

```sh
testcafe chrome test.js --video reports/screen-captures
```

See [Record Videos](../guides/advanced-guides/screenshots-and-videos.md#record-videos) for details.

*Related configuration file property*: [videoPath](configuration-file.md#videopath).

### --video-options \<option=value\[,option2=value2,...\]\>

Specifies options that define how TestCafe records videos of test runs.

```sh
testcafe chrome test.js --video videos --video-options singleFile=true,failedOnly=true
```

See [Basic Video Options](../guides/advanced-guides/screenshots-and-videos.md#basic-video-options) for details.

Enclose parameter values in quotes if they contain spaces:

```sh
testcafe chrome test.js --video videos --video-options pathPattern='${DATE} ${TIME}/test ${TEST_INDEX}/${USERAGENT}/${FILE_INDEX}.png'
```

In Windows `cmd.exe` shell, use double quotes:

```sh
testcafe chrome test.js --video videos --video-options pathPattern="${DATE} ${TIME}/test ${TEST_INDEX}/${USERAGENT}/${FILE_INDEX}.png"
```

> Use the [--video](#--video-basepath) flag to enable video recording.

*Related configuration file property*: [videoOptions](configuration-file.md#videooptions).

### --video-encoding-options \<option=value\[,option2=value2,...\]\>

Specifies video encoding options.

```sh
testcafe chrome test.js --video videos --video-encoding-options r=20,aspect=4:3
```

See [Video Encoding Options](../guides/advanced-guides/screenshots-and-videos.md#video-encoding-options) for details.

> Use the [--video](#--video-basepath) flag to enable video recording.

*Related configuration file property*: [videoEncodingOptions](configuration-file.md#videoencodingoptions).

### -q, --quarantine-mode

Enables the [quarantine mode](../guides/basic-guides/run-tests.md#quarantine-mode) for tests that fail.

```sh
testcafe all tests/sample-fixture.js -q
```

*Related configuration file property*: [quarantineMode](configuration-file.md#quarantinemode).

### -d, --debug-mode

Specify this option to run tests in the debug mode. In this mode, test execution is paused before the first action or assertion so that you can invoke the developer tools and debug.

The footer displays a status bar in which you can resume test execution or skip to the next action or assertion.

![Debugging status bar](../../images/debugging/client-debugging-footer.png)

> If the test you run in the debug mode contains a [test hook](../guides/basic-guides/organize-tests.md#test-hooks),
> it is paused within this hook before the first action.

You can also use the **Unlock page** switch in the footer to unlock the tested page and interact with its elements.

*Related configuration file property*: [debugMode](configuration-file.md#debugmode).

### --debug-on-fail

Specifies whether to automatically enter the [debug mode](#-d---debug-mode) when a test fails.

```sh
testcafe chrome tests/sample-fixture.js --debug-on-fail
```

If this option is enabled, TestCafe pauses the test when it fails. This allows you to view the tested page and determine the cause of the fail.

When you are done, click the **Finish** button in the footer to end test execution.

*Related configuration file property*: [debugOnFail](configuration-file.md#debugonfail).

### -e, --skip-js-errors

When a JavaScript error occurs on a tested web page, TestCafe stops test execution and posts an error message and a stack trace to a report. To ignore JavaScript errors, use the `-e`(`--skip-js-errors`) option.

For example, the following command runs tests from the specified file and forces TestCafe to ignore JavaScript errors:

```sh
testcafe ie tests/sample-fixture.js -e
```

*Related configuration file property*: [skipJsErrors](configuration-file.md#skipjserrors).

### -u, --skip-uncaught-errors

When an uncaught error or unhandled promise rejection occurs on the server during test execution, TestCafe stops the test and posts an error message to a report.

To ignore these errors, use the `-u`(`--skip-uncaught-errors`) option.

For example, the following command runs tests from the specified file and forces TestCafe to ignore uncaught errors and unhandled promise rejections:

```sh
testcafe ie tests/sample-fixture.js -u
```

*Related configuration file property*: [skipUncaughtErrors](configuration-file.md#skipuncaughterrors).

### -t \<name\>, --test \<name\>

TestCafe runs a test with the specified name.

For example, the following command runs only the `"Click a label"` test from the `sample-fixture.js` file:

```sh
testcafe ie tests/sample-fixture.js -t "Click a label"
```

*Related configuration file property*: [filter.test](configuration-file.md#filtertest).

### -T \<pattern\>, --test-grep \<pattern\>

TestCafe runs tests whose names match the specified `grep` pattern.

For example, the following command runs tests whose names match `Click.*`. These can be `Click a label`, `Click a button`, etc.

```sh
testcafe ie my-tests -T "Click.*"
```

*Related configuration file property*: [filter.testGrep](configuration-file.md#filtertestgrep).

### -f \<name\>, --fixture \<name\>

TestCafe runs a fixture with the specified name.

```sh
testcafe ie my-tests -f "Sample fixture"
```

*Related configuration file property*: [filter.fixture](configuration-file.md#filterfixture).

### -F \<pattern\>, --fixture-grep \<pattern\>

TestCafe runs fixtures whose names match the specified `grep` pattern.

For example, the following command runs fixtures whose names match `Page.*`. These can be `Page1`, `Page2`, etc.

```sh
testcafe ie my-tests -F "Page.*"
```

*Related configuration file property*: [filter.fixtureGrep](configuration-file.md#filterfixturegrep).

### --test-meta \<key=value\[,key2=value2,...\]\>

TestCafe runs tests whose [metadata](../guides/basic-guides/organize-tests.md#specify-test-metadata) matches the specified key-value pair.

For example, the following command runs tests whose metadata's `device` property is set to `mobile`, and `env` property is set to `production`.

```sh
testcafe chrome my-tests --test-meta device=mobile,env=production
```

*Related configuration file property*: [filter.testMeta](configuration-file.md#filtertestmeta).

### --fixture-meta \<key=value\[,key2=value2,...\]\>

TestCafe runs tests whose fixture's [metadata](../guides/basic-guides/organize-tests.md#specify-test-metadata) matches the specified key-value pair.

For example, the following command runs tests whose fixture's metadata has the `device` property set to the `mobile` value and the `env` property set to the `production` value.

```sh
testcafe chrome my-tests --fixture-meta device=mobile,env=production
```

*Related configuration file property*: [filter.fixtureMeta](configuration-file.md#filterfixturemeta).

### -a \<command\>, --app \<command\>

Executes the specified shell command before tests are started. Use it to set up the application you need to test.

An application is automatically terminated after tests are finished.

```sh
testcafe chrome my-tests --app "node server.js"
```

> TestCafe adds `node_modules/.bin` to `PATH` so that you can use the binaries the locally installed dependencies provide without prefixes.

Use the [--app-init-delay](#--app-init-delay-ms) option to specify the amount of time allowed for this command to initialize the tested application.

*Related configuration file property*: [appCommand](configuration-file.md#appcommand).

### --app-init-delay \<ms\>

Specifies the time (in milliseconds) allowed for an application launched with the [--app](#-a-command---app-command) option to initialize.

TestCafe waits the specified time before it starts the tests.

**Default value**: `1000`

```sh
testcafe chrome my-tests --app "node server.js" --app-init-delay 4000
```

*Related configuration file property*: [appInitDelay](configuration-file.md#appinitdelay).

### -c \<n\>, --concurrency \<n\>

Specifies that tests should run concurrently.

TestCafe opens `n` instances of the same browser and creates a pool of browser instances.
Tests are run concurrently against this pool, that is, each test is run in the first free instance.

See [Concurrent Test Execution](../guides/basic-guides/run-tests.md#run-tests-concurrently) for more information about concurrent test execution.

The following example shows how to run tests in three Chrome instances:

```sh
testcafe -c 3 chrome tests/sample-fixture.js
```

*Related configuration file property*: [concurrency](configuration-file.md#concurrency).

### --selector-timeout \<ms\>

Specifies the time (in milliseconds) within which [selectors](../guides/basic-guides/select-page-elements.md) attempt to obtain a node to be returned. See [Selector Timeout](../guides/basic-guides/select-page-elements.md#selector-timeout).

**Default value**: `10000`

```sh
testcafe ie my-tests --selector-timeout 500000
```

*Related configuration file property*: [selectorTimeout](configuration-file.md#selectortimeout).

### --assertion-timeout \<ms\>

Specifies the time (in milliseconds) TestCafe attempts to successfully execute an [assertion](../guides/basic-guides/assert.md)
if a [selector property](../guides/basic-guides/select-page-elements.md#define-assertion-actual-value)
or a [client function](../guides/basic-guides/obtain-client-side-info.md) was passed as an actual value.
See [Smart Assertion Query Mechanism](../guides/basic-guides/assert.md#smart-assertion-query-mechanism).

**Default value**: `3000`

```sh
testcafe ie my-tests --assertion-timeout 10000
```

*Related configuration file property*: [assertionTimeout](configuration-file.md#assertiontimeout).

### --page-load-timeout \<ms\>

Specifies the time (in milliseconds) passed after the `DOMContentLoaded` event, within which TestCafe waits for the `window.load` event to fire.

After the timeout passes or the `window.load` event is raised (whichever happens first), TestCafe starts the test.

> Note that the `DOMContentLoaded` event is raised after the HTML document is loaded and parsed, while `window.load` is raised after all stylesheets, images and subframes are loaded. That is why `window.load` is fired after the `DOMContentLoaded` event with a certain delay.

**Default value**: `3000`

You can set the page load timeout to `0` to skip waiting for the `window.load` event.

```sh
testcafe ie my-tests --page-load-timeout 0
```

*Related configuration file property*: [pageLoadTimeout](configuration-file.md#pageloadtimeout).

### --speed \<factor\>

Specifies the test execution speed.

Tests are run at the maximum speed by default. You can use this option
to slow the test down.

`factor` should be a number between `1` (the fastest) and `0.01` (the slowest).

```sh
testcafe chrome my-tests --speed 0.1
```

If the speed is also specified for an individual action, the action's speed setting overrides the test speed.

**Default value**: `1`

*Related configuration file property*: [speed](configuration-file.md#speed).

### --cs \<path\[,path2,...\]\>, --client-scripts \<path\[,path2,...\]\>

Injects scripts from the specified files into each page visited during the tests. Use this option to introduce client-side mock functions or helper scripts.

```sh
testcafe chrome my-tests --client-scripts mockDate.js,assets/react-helpers.js
```

Pass the [path to a JavaScript file](../guides/advanced-guides/inject-client-scripts.md#inject-a-javascript-file) to inject its content.

> Relative paths are resolved against the current working directory.

Use the [fixture.clientScripts](test-api/fixture/clientscripts.md) and [test.clientScripts](test-api/test/clientscripts.md) methods in test code to inject scripts for an individual fixture or test.

You can also [inject modules](../guides/advanced-guides/inject-client-scripts.md#inject-a-module), [code strings](../guides/advanced-guides/inject-client-scripts.md#inject-script-code), or [add scripts to individual pages](../guides/advanced-guides/inject-client-scripts.md#provide-scripts-for-specific-pages) in the API and configuration file. Use the following methods and options to do this:

* the [runner.clientScripts](testcafe-api/runner/clientscripts.md) programming interface method
* the [clientScripts](configuration-file.md#clientscripts) configuration file property
* the [fixture.clientScripts](test-api/fixture/clientscripts.md) and [test.clientScripts](test-api/test/clientscripts.md) test API methods (add scripts to pages visited during a particular fixture or test)

See [Inject Client Scripts](../guides/advanced-guides/inject-client-scripts.md) for more information.

*Related configuration file property*: [clientScripts](configuration-file.md#clientscripts).

### --ports \<port1,port2\>

Specifies custom port numbers TestCafe uses to perform testing. The number range is [0-65535].

TestCafe automatically selects ports if ports are not specified.

```sh
testcafe chrome my-tests --ports 12345,54321
```

*Related configuration file properties*: [port1, port2](configuration-file.md#port1-port2).

### --hostname \<name\>

Specifies the computer's hostname. TestCafe uses this hostname when it runs tests in [remote browsers](#remote-browsers).

If the hostname is not specified, TestCafe uses the operating system's hostname or the current machine's network IP address.

```sh
testcafe chrome my-tests --hostname host.mycorp.com
```

*Related configuration file property*: [hostname](configuration-file.md#hostname).

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

*Related configuration file property*: [proxy](configuration-file.md#proxy).

### --proxy-bypass \<rules\>

Requires that TestCafe bypasses the proxy server to access the specified resources.

When you access the Internet through a proxy server (you can specify the server address with the [--proxy](#--proxy-host) option), you may still need some local or external resources to be accessed directly. In this instance, provide their URLs to the `--proxy-bypass` option.

The `rules` parameter takes a comma-separated list (without spaces) of URLs that require direct access. You can replace parts of the URL with the `*` wildcard that matches any number of characters. Wildcards at the beginning and end of the rules can be omitted (`*.mycompany.com` and `.mycompany.com` have the same effect).

The following example uses the proxy server at `proxy.corp.mycompany.com` with the `localhost:8080` address accessed directly:

```sh
testcafe chrome my-tests/**/*.js --proxy proxy.corp.mycompany.com --proxy-bypass localhost:8080
```

In the example below, TestCafe bypasses the proxy server to access two resources: `localhost:8080` and `internal-resource.corp.mycompany.com`.

```sh
testcafe chrome my-tests/**/*.js --proxy proxy.corp.mycompany.com --proxy-bypass localhost:8080,internal-resource.corp.mycompany.com
```

The `*.mycompany.com` value means that all URLs in the `mycompany.com` subdomains are accessed directly.

```sh
testcafe chrome my-tests/**/*.js --proxy proxy.corp.mycompany.com --proxy-bypass *.mycompany.com
```

*Related configuration file property*: [proxyBypass](configuration-file.md#proxybypass).

### --ssl \<options\>

Provides options that allow you to establish an HTTPS connection between the client browser and the TestCafe server.

The `options` parameter contains options required to initialize
[a Node.js HTTPS server](https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener).
The most commonly used SSL options are described in the [TLS topic](https://nodejs.org/api/tls.html#tls_tls_createsecurecontext_options) in Node.js documentation.
Options are specified in a semicolon-separated string.

```sh
testcafe --ssl pfx=path/to/file.pfx;rejectUnauthorized=true;...
```

Provide the `--ssl` flag if the tested webpage uses browser features that require
secure origin ([Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API), [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API), [ApplePaySession](https://developer.apple.com/documentation/apple_pay_on_the_web/applepaysession), [SubtleCrypto](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto), etc).
See [Test HTTPS and HTTP/2 Websites](../guides/advanced-guides/test-https-features-and-http2-websites.md) for more information.

*Related configuration file property*: [ssl](configuration-file.md#ssl).

### -L, --live

Enables live mode. In this mode, TestCafe watches for changes you make in the test files and all files referenced in them (like page objects or helper modules). These changes immediately restart the tests so that you can see the effect.

See [Live Mode](../guides/basic-guides/run-tests.md) for more information.

### --dev

Enables mechanisms to log and diagnose errors. You should enable this option if you plan to contact TestCafe Support to report an issue.

```sh
testcafe chrome my-tests --dev
```

*Related configuration file property*: [developmentMode](configuration-file.md#developmentmode).

### --qr-code

Outputs a QR-code that represents URLs used to connect the [remote browsers](#remote-browsers).

```sh
testcafe remote my-tests --qr-code
```

*Related configuration file property*: [qrCode](configuration-file.md#qrcode).

### --sf, --stop-on-first-fail

Stops an entire test run if any test fails. Use this option when you want to fix failed tests individually and do not need a report on all the failures.

```sh
testcafe chrome my-tests --sf
```

*Related configuration file property*: [stopOnFirstFail](configuration-file.md#stoponfirstfail).

### --ts-config-path \<path\>

Enables TestCafe to use a custom [TypeScript configuration file](../guides/concepts/typescript-and-coffeescript.md#customize-compiler-options) and specifies its location.

```sh
testcafe chrome my-tests --ts-config-path /Users/s.johnson/testcafe/tsconfig.json
```

You can specify an absolute or relative path. Relative paths are resolved against the current directory (the directory from which you run TestCafe).

*Related configuration file property*: [tsConfigPath](configuration-file.md#tsconfigpath).

### --disable-page-caching

Prevents the browser from caching page content.

```sh
testcafe chrome my-tests --disable-page-caching
```

When navigation to a cached page occurs in [role code](../guides/advanced-guides/authentication.md#user-roles), local and session storage content is not preserved. Use the `--disable-page-caching` flag to retain the storage items after navigation. For more information, see [Troubleshooting: Test Actions Fail After Authentication](../guides/advanced-guides/authentication.md#test-actions-fail-after-authentication).

You can also disable page caching for an individual [fixture](test-api/fixture/disablepagecaching.md) or [test](test-api/test/disablepagecaching.md).

*Related configuration file property*: [disablePageCaching](configuration-file.md#disablepagecaching).

### --color

Enables colors in the command line.

*Related configuration file property*: [color](configuration-file.md#color).

### --no-color

Disables colors in the command line.

*Related configuration file property*: [noColor](configuration-file.md#nocolor).