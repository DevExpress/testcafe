---
layout: docs
title: Run Tests
permalink: /documentation/guides/basic-guides/run-tests.html
redirect_from:
  - /documentation/using-testcafe/common-concepts/concurrent-test-execution.html
  - /documentation/using-testcafe/common-concepts/live-mode.html
---
# Run Tests

You can run TestCafe tests from the [command line](../../reference/command-line-interface.md) or JavaScript/TypeScript API.

```sh
testcafe safari ./tests/my-fixture.js
```

```js
const createTestCafe = require('testcafe');
const testCafe       = await createTestCafe('localhost', 1337, 1338);
const runner         = testCafe.createRunner();

await runner
    .src('./tests/my-fixture.js')
    .browsers('safari')
    .run();

testCafe.close();
```

TestCafe also allows you to create a [configuration file](../../reference/configuration-file.md) where you can define test run settings. You can then omit these settings in the command line or API to use values from the configuration file.

* [Specify Tests to Run](#specify-tests-to-run)
  * [Run Tests From Multiple Sources](#run-tests-from-multiple-sources)
  * [Use Glob Patterns](#use-glob-patterns)
  * [Filter Tests and Fixtures by Name](#filter-tests-and-fixtures-by-name)
  * [Filter Tests and Fixtures by Metadata](#filter-tests-and-fixtures-by-metadata)
* [Specify Target Browsers](#specify-target-browsers)
  * [Use Multiple Browsers](#use-multiple-browsers)
  * [Run Tests in All Installed Browsers](#run-tests-in-all-installed-browsers)
  * [Test in Portable Browsers](#test-in-portable-browsers)
  * [Use Headless Mode](#use-headless-mode)
  * [Enable Mobile Device Emulation](#enable-mobile-device-emulation)
  * [Test in Cloud Testing Services](#test-in-cloud-testing-services)
  * [Test on Remote and Mobile Devices](#test-on-remote-and-mobile-devices)
* [Specify the Report Format](#specify-the-report-format)
* [Customize Screenshot and Video Settings](#customize-screenshot-and-video-settings)
* [Run Tests Concurrently](#run-tests-concurrently)
* [Stage the Tested App](#stage-the-tested-app)
* [Provide a Proxy URL](#provide-a-proxy-url)
* [Live Mode](#live-mode)
  * [How Live Mode Works](#how-live-mode-works)
  * [Console Shortcuts in Live Mode](#console-shortcuts-in-live-mode)
* [Quarantine Mode](#quarantine-mode)

## Specify Tests to Run

You should specify a path to a file or directory with tests you want to run in the [second command line argument](../../reference/command-line-interface.md#file-pathglob-pattern):

```sh
testcafe chrome ./tests/
```

In the API, use the [runner.src](../../reference/testcafe-api/runner/src.md) method:

```js
await runner
    .browsers('chrome')
    .src('./tests/')
    .run();
```

*Related configuration file property:* [src](../../reference/configuration-file.md#src)

### Run Tests From Multiple Sources

You can specify multiple test files or directories:

```sh
testcafe safari ./js-tests/fixture.js ./studio-tests/fixture.testcafe
```

```js
await runner
    .browsers('safari')
    .src(['./js-tests/fixture.js', './studio-tests/fixture.testcafe'])
    .run();
```

### Use Glob Patterns

TestCafe also supports [glob patterns](https://github.com/isaacs/node-glob#glob-primer) to run a set of files that match a specified pattern:

```sh
testcafe firefox ./tests/*mobile*
```

```js
await runner
    .browsers('firefox')
    .src('./tests/*mobile*')
    .run();
```

### Filter Tests and Fixtures by Name

Use the [-t (--test)](../../reference/command-line-interface.md#-t-name---test-name) command line argument or [runner.filter](../../reference/testcafe-api/runner/filter.md) method to run a test by name:

```sh
testcafe safari ./tests/sample-fixture.js -t "Click a label"
```

```js
await runner
    .browsers('safari')
    .src('./tests/sample-fixture.js')
    .filter(testName => testName === 'Click a label')
    .run();
```

*Related configuration file property:* [filter.test](../../reference/configuration-file.md#filtertest)

You can also use the [-T (--test-grep)](../../reference/command-line-interface.md#-t-pattern---test-grep-pattern) argument to specify a `grep` pattern for the test name:

```sh
testcafe chrome ./my-tests/ -T "Click.*"
```

*Related configuration file property:* [filter.testGrep](../../reference/configuration-file.md#filtertestgrep)

To run a fixture by name, use the [-f (--fixture)](../../reference/command-line-interface.md#-f-name---fixture-name) argument:

```sh
testcafe firefox ./my-tests/ -f "Sample fixture"
```

The [runner.filter](../../reference/testcafe-api/runner/filter.md) method's predicate accepts the `fixtureName` parameter:

```js
await runner
    .browsers('firefox')
    .src('./my-tests/')
    .filter((testName, fixtureName) => fixtureName === 'Sample fixture')
    .run();
```

*Related configuration file property:* [filter.fixture](../../reference/configuration-file.md#filterfixture)

To use `grep` patterns for a fixture name, specify the [-F (--fixture-grep)](../../reference/command-line-interface.md#-f-pattern---fixture-grep-pattern) option:

```sh
testcafe safari ./my-tests/ -F "Page.*"
```

*Related configuration file property:* [filter.fixtureGrep](../../reference/configuration-file.md#filterfixturegrep)

### Filter Tests and Fixtures by Metadata

You can also run tests whose metadata contains specific values. Use the [--test-meta](../../reference/command-line-interface.md#--test-meta-keyvaluekey2value2) argument to do this:

```sh
testcafe chrome ./my-tests/ --test-meta device=mobile,env=production
```

The [runner.filter](../../reference/testcafe-api/runner/filter.md) method's predicate accepts the `testMeta` parameter:

```js
await runner
    .browsers('chrome')
    .src('./my-tests/')
    .filter((testName, fixtureName, fixturePath, testMeta) => {
        return testMeta.device === 'mobile' && testMeta.env === 'production';
    })
    .run();
```

*Related configuration file property:* [filter.testMeta](../../reference/configuration-file.md#filtertestmeta)

To filter fixtures with specific metadata, use the [--fixture-meta](../../reference/command-line-interface.md#--fixture-meta-keyvaluekey2value2) argument:

```sh
testcafe firefox ./my-tests/ --fixture-meta device=mobile,env=production
```

In [runner.filter](../../reference/testcafe-api/runner/filter.md), the fixture metadata is available in the `fixtureMeta` parameter:

```js
await runner
    .browsers('firefox')
    .src('./my-tests/')
    .filter((testName, fixtureName, fixturePath, testMeta, fixtureMeta) => {
        return fixtureMeta.device === 'mobile' && fixtureMeta.env === 'production';
    })
    .run();
```

*Related configuration file property:* [filter.fixtureMeta](../../reference/configuration-file.md#filterfixturemeta)

## Specify Target Browsers

You should specify the browsers where you want to run tests in the first command line parameter.

TestCafe automatically detects supported browsers installed on the local machine. Use [browser aliases](../concepts/browsers.md) to identify the target browser:

```sh
testcafe chrome ./tests/
```

In the API, use the [runner.browsers](../../reference/testcafe-api/runner/browsers.md) method:

```js
await runner
    .browsers('chrome')
    .src('./tests/')
    .run();
```

*Related configuration file property:* [browsers](../../reference/configuration-file.md#browsers)

### Use Multiple Browsers

You can run tests in several browsers. In the command line, specify a comma-separated browser list:

```sh
testcafe safari,chrome ./tests/
```

In the API, pass an array of browser identifiers to [runner.browsers](../../reference/testcafe-api/runner/browsers.md):

```js
await runner
    .browsers(['safari', 'chrome'])
    .src('./tests/')
    .run();
```

### Run Tests in All Installed Browsers

Use the `all` alias to run tests in all locally installed browsers [TestCafe can detect](../concepts/browsers.md#locally-installed-browsers):

```sh
testcafe all ./tests/
```

```js
await runner
    .browsers('all')
    .src('./tests/')
    .run();
```

### Test in Portable Browsers

You can also specify the path to a browser executable to [launch portable browsers](../concepts/browsers.md#portable-browsers). Use the `path:` prefix followed by the full path:

```sh
testcafe path:d:\firefoxportable\firefoxportable.exe ./tests/
```

```js
await runner
    .browsers('path:d:\firefoxportable\firefoxportable.exe')
    .src('./tests/')
    .run();
```

> Note that if the path contains spaces, you should escape them in the command line [as described in this topic](../../reference/command-line-interface.md#portable-browsers).

### Use Headless Mode

TestCafe can run tests in [headless mode](../concepts/browsers.md#test-in-headless-mode) in browsers that support it. To run tests in headless mode, put the `:headless` suffix after the browser name:

```sh
testcafe firefox:headless ./tests/
```

```js
await runner
    .browsers('firefox:headless')
    .src('./tests/')
    .run();
```

### Enable Mobile Device Emulation

You can use [Google Chrome mobile device emulation](../concepts/browsers.md#use-chromium-device-emulation) to test mobile layout and features on desktops. Specify the `:emulation` postfix followed by emulation options:

```sh
testcafe "chrome:emulation:device=iphone X" ./tests/sample-fixture.js
```

```js
await runner
    .browsers('chrome:emulation:device=iphone X')
    .src('./tests/sample-fixture.js')
    .run();
```

### Test in Cloud Testing Services

TestCafe can also run tests in cloud testing services such as BrowserStack or SauceLabs. Install the [browser provider](../concepts/browsers.md#browsers-in-cloud-testing-services) for your service and specify the browser alias as described in the browser provider documentation.

For instance, to use SauceLabs, install the [testcafe-browser-provider-saucelabs](https://github.com/DevExpress/testcafe-browser-provider-saucelabs) module from `npm` and run tests as follows:

```sh
testcafe "saucelabs:Chrome@52.0:Windows 8.1" ./tests/sample-fixture.js
```

```js
await runner
    .browsers('saucelabs:Chrome@52.0:Windows 8.1')
    .src('./tests/sample-fixture.js')
    .run();
```

### Test on Remote and Mobile Devices

To run tests [remotely on a mobile device](../concepts/browsers.md#browsers-on-remote-devices) or a computer with no TestCafe installation, specify `remote` instead of the browser alias in the command line:

```sh
testcafe remote ./tests/sample-fixture.js
```

TestCafe generates a URL and displays it in the console. When you visit this URL from the remote device, TestCafe runs tests in this browser. To run tests in several remote browsers, specify their number after the `remote` keyword: `remote:2` or `remote:4`.

In the API, create a remote browser connection with the [testcafe.createBrowserConnection](../../reference/testcafe-api/testcafe/createbrowserconnection.md) method, visit the generated URL and run tests once the connection is initialized:

```js
const createTestCafe   = require('testcafe');
const testCafe         = await createTestCafe('localhost', 1337, 1338);
const runner           = testCafe.createRunner();
const remoteConnection = testcafe.createBrowserConnection();

// Visit this URL from the remote device.
console.log(remoteConnection.url);

// Wait until the remote device's browser connects.
await new Promise(resolve => remoteConnection.once('ready', resolve));

await runner
    .src('./tests/sample-fixture.js')
    .browsers(remoteConnection)
    .run();
```

## Specify the Report Format

A *reporter* is a module that formats and outputs test run results. TestCafe ships with five basic reporters, including reporters for spec, JSON, and xUnit formats. You can [install other reporters](../concepts/reporters.md) as plugins or [create a custom reporter](../extend-testcafe/reporter-plugin.md).

Use the [-r (--reporter)](../../reference/command-line-interface.md#-r-nameoutput---reporter-nameoutput) flag in the command line and the [runner.reporter](../../reference/testcafe-api/runner/reporter.md) method in the API to specify which reporter to use.

```sh
testcafe all ./tests/sample-fixture.js -r xunit
```

```js
await runner
    .browsers('all')
    .src('./tests/sample-fixture.js')
    .reporter('xunit')
    .run();
```

```sh
testcafe all ./tests/sample-fixture.js -r my-reporter
```

```js
await runner
    .browsers('all')
    .src('./tests/sample-fixture.js')
    .reporter('my-reporter')
    .run();
```

*Related configuration file property:* [reporter](../../reference/configuration-file.md#reporter)

To define the output target, specify it after a semicolon in the command line or as the second parameter in [runner.reporter](../../reference/testcafe-api/runner/reporter.md).

```sh
testcafe all ./tests/sample-fixture.js -r json:report.json
```

```js
await runner
    .browsers('all')
    .src('./tests/sample-fixture.js')
    .reporter('json', 'report.json')
    .run();
```

You can use multiple reporters, but only one reporter can write to `stdout`:

```sh
testcafe all ./tests/sample-fixture.js -r spec,xunit:report.xml
```

```js
await runner
    .browsers('all')
    .src('./tests/sample-fixture.js')
    .reporter(['spec', {
        name: 'xunit',
        output: 'report.xml'
    })
    .run();
```

## Customize Screenshot and Video Settings

TestCafe can take screenshots of the tested page automatically when a test fails. You can also capture screenshots at arbitrary moments with the [t.takeScreenshot](../../reference/test-api/testcontroller/takescreenshot.md) and [t.takeElementScreenshot](../../reference/test-api/testcontroller/takeelementscreenshot.md) actions.

Use the [-s (--screenshots)](../../reference/command-line-interface.md#-s---screenshots-optionvalueoption2value2) command line flag or the [runner.screenshots](../../reference/testcafe-api/runner/screenshots.md) API method.

```sh
testcafe all ./tests/sample-fixture.js -s path=artifacts/screenshots,takeOnFails=true
```

```js
await runner
    .browsers('all')
    .src('./tests/sample-fixture.js')
    .screenshots({
        path: 'artifacts/screenshots',
        takeOnFails: true
    })
    .run();
```

*Related configuration file property:* [screenshots](../../reference/configuration-file.md#screenshots)

To record videos of test runs, pass the [--video](../../reference/command-line-interface.md#--video-basepath) command line flag or use the [runner.video](../../reference/testcafe-api/runner/video.md) API method.

You can also specify video recording options in the [--video-options](../../reference/command-line-interface.md#--video-options-optionvalueoption2value2) command line argument or a [runner.video](../../reference/testcafe-api/runner/video.md) parameter:

```sh
testcafe chrome ./test.js --video ./videos/ --video-options singleFile=true,failedOnly=true
```

```js
await runner
    .browsers('chrome')
    .src('./test.js')
    .video('./videos/', {
        singleFile: true,
        failedOnly: true
    })
    .run();
```

*Related configuration file properties:*

* [videoPath](../../reference/configuration-file.md#videopath)
* [videoOptions](../../reference/configuration-file.md#videooptions)

## Run Tests Concurrently

To save time spent on testing, TestCafe allows you to execute tests *concurrently*. In concurrent mode, TestCafe invokes multiple instances of each browser. These instances constitute the pool of browsers against which tests run concurrently, i.e. each test runs in the first available instance.

To enable concurrency, use the [-c (--concurrency)](../../reference/command-line-interface.md#-c-n---concurrency-n) command line option or the [runner.concurrency](../../reference/testcafe-api/runner/concurrency.md) API method.

> Important! Concurrent test execution is not supported in Microsoft Edge. This is because there is no known way to start Edge in a new window and make it open a particular URL.

The following command invokes three Chrome instances and runs tests concurrently.

```sh
testcafe -c 3 chrome tests/test.js
```

This is how the same thing can be done through the API.

```js
var testRunPromise = runner
    .src('tests/test.js')
    .browsers('chrome')
    .concurrency(3)
    .run();
```

*Related configuration file property:* [concurrency](../../reference/configuration-file.md#concurrency)

Note that you can also use concurrency when testing against multiple browsers.

```sh
testcafe -c 4 safari,firefox tests/test.js
```

In this case, tests are distributed across four Safari instances and the same tests are also run in four Firefox instances.

> If an uncaught error or unhandled promise rejection occurs on the server during test execution, all tests running concurrently will fail.

When you run tests on [remote devices](../../reference/command-line-interface.md#remote-browsers),
create connections for each instance of each browser you test against. When using
the command line interface, specify this number after the `remote:` keyword. In API, create
a [browser connection](../../reference/testcafe-api/browserconnection/README.md) for each instance.

On a remote device, invoke all the required instances manually. The total number of instances
should divide by the concurrency parameter `n`. Otherwise, an exception will be thrown.

```sh
testcafe -c 2 remote:4 tests/test.js
```

If you test against multiple remote browsers, open and connect all instances of one browser before connecting the next browser.

## Stage the Tested App

TestCafe can execute a specified shell command before it starts tests. For instance, you can run a command that starts a local web server and deploys the tested app. TestCafe automatically terminates the process when tests are finished.

Use the [-a (--app)](../../reference/command-line-interface.md#-a-command---app-command) CLI flag or the [runner.startApp](../../reference/testcafe-api/runner/startapp.md) API method to provide a command:

```sh
testcafe chrome ./my-tests/ --app "node server.js"
```

```js
await runner
    .browsers('chrome')
    .src('./my-tests/')
    .startApp('node server.js')
    .run();
```

*Related configuration file property:* [appCommand](../../reference/configuration-file.md#appcommand)

TestCafe delays tests to allow the shell command to execute. The default timeout is *1000* milliseconds. Use the [--app-init-delay](../../reference/command-line-interface.md#--app-init-delay-ms) CLI flag or a [runner.startApp](../../reference/testcafe-api/runner/startapp.md) parameter to specify the timeout value.

```sh
testcafe chrome ./my-tests/ --app "node server.js" --app-init-delay 4000
```

```js
await runner
    .browsers('chrome')
    .src('./my-tests/')
    .startApp('node server.js', 4000)
    .run();
```

*Related configuration file property:* [appInitDelay](../../reference/configuration-file.md#appinitdelay)

## Provide a Proxy URL

If your network uses a proxy to access the internet, specify the proxy URL to TestCafe. Use the [--proxy](../../reference/command-line-interface.md#--proxy-host) command line argument or the [runner.useProxy](../../reference/testcafe-api/runner/useproxy.md) API method:

```sh
testcafe chrome ./my-tests/ --proxy proxy.mycompany.com
```

```js
await runner
    .browsers('chrome')
    .src('./my-tests/')
    .useProxy('proxy.mycompany.com')
    .run();
```

*Related configuration file property:* [proxy](../../reference/configuration-file.md#proxy)

You can also specify URLs that should be accessed directly. Pass the list of URLs in the [--proxy-bypass](../../reference/command-line-interface.md#--proxy-bypass-rules) command line argument or a [runner.useProxy](../../reference/testcafe-api/runner/useproxy.md) parameter:

```sh
testcafe chrome ./my-tests/ --proxy proxy.corp.mycompany.com --proxy-bypass localhost:8080
```

```js
await runner
    .browsers('chrome')
    .src('./my-tests/')
    .useProxy('proxy.corp.mycompany.com', 'localhost:8080')
    .run();
```

*Related configuration file property:* [proxyBypass](../../reference/configuration-file.md#proxybypass)

## Live Mode

Live mode ensures TestCafe and the browsers remain active while you work on tests. You can see test results instantly because the tests are restarted when you make changes.

![Live mode demonstrated in action](../../../images/testcafe-live.gif)

> This feature replaces the deprecated `testcafe-live` module.

### How to Enable Live Mode

Use the [-L (--live)](../../reference/command-line-interface.md#-l---live) flag to enable live mode from the command line interface.

```sh
testcafe chrome tests/test.js -L
```

In the API, create a [live mode runner](../../reference/testcafe-api/livemoderunner.md) with the [testcafe.createLiveModeRunner](../../reference/testcafe-api/testcafe/createlivemoderunner.md) function and use it instead of a [regular test runner](../../reference/testcafe-api/runner/README.md).

```js
const createTestCafe = require('testcafe');
let testcafe         = null;

createTestCafe('localhost', 1337, 1338)
    .then(tc => {
        testcafe         = tc;
        const liveRunner = testcafe.createLiveModeRunner();

        return liveRunner
            .src('tests/test.js')
            .browsers('chrome')
            .run();
    })
    .then(() => {
        testcafe.close();
    });
```

### How Live Mode Works

When you run tests with live mode enabled, TestCafe opens the browsers, runs the tests, shows the reports, and waits for further actions.

Then TestCafe starts watching for changes in the test files and all files referenced in them (like page objects or helper modules). Once you make changes in any of those files and save them, TestCafe immediately reruns the tests.

When the tests are done, the browsers stay on the last opened page so you can work with it and explore it with the browser's developer tools.

You can use live mode with any browsers: local, remote, mobile or headless.

> Important! Live mode is designed to work with tests locally. Do not use it in CI systems.

**Tip:** use the [only](organize-tests.md#skip-tests) function to work with a single test.

### Console Shortcuts in Live Mode

* `Ctrl+S` - stops the current test run;
* `Ctrl+R` - restarts the current test run;
* `Ctrl+W` - turns off/on the file watcher;
* `Ctrl+C` - closes opened browsers and terminates the process.

## Quarantine Mode

The quarantine mode is designed to isolate *non-deterministic* tests (that is, tests that pass and fail without any apparent reason) from the other tests.

When the quarantine mode is enabled, tests run according to the following logic:

1. A test runs at the first time. If it passes, TestCafe proceeds to the next test.
2. If the test fails, it runs again until it passes or fails three times.
3. The most frequent outcome is recorded as the test result.
4. If the test result differs between test runs, the test is marked as unstable.

Use the [-q (--quarantine-mode)](../../reference/command-line-interface.md#-q---quarantine-mode) command line flag or the `quarantineMode` option in the [runner.run](../../reference/testcafe-api/runner/run.md) method to enable quarantine mode:

```sh
testcafe chrome ./tests/ -q
```

```js
await runner
    .browsers('chrome')
    .src('./tests/')
    .run({ quarantineMode: true });
```

> Note that quarantine mode increases the test task's duration because failed tests are executed three to five times.

See Martin Fowler's [Eradicating Non-Determinism in Tests](http://martinfowler.com/articles/nonDeterminism.html) article for more information about non-deterministic tests.
