---
layout: docs
title: Runner Class
permalink: /documentation/using-testcafe/programming-interface/runner.html
checked: true
---
# Runner Class

An object that configures and launches test tasks.

Created using the [testCafe.createRunner](testcafe.md#createrunner) function.

**Example**

```js
const createTestCafe = require('testcafe');
let testcafe         = null;

createTestCafe('localhost', 1337, 1338)
    .then(tc => {
        testcafe     = tc;
        const runner = testcafe.createRunner();

        return runner
            .src(['tests/fixture1.js', 'tests/func/fixture3.js'])
            .browsers(['chrome', 'safari'])
            .run();
    })
    .then(failedCount => {
        console.log('Tests failed: ' + failedCount);
        testcafe.close();
    });
```

## Methods

* [src](#src)
* [filter](#filter)
* [browsers](#browsers)
    * [Using Browser Aliases](#using-browser-aliases)
    * [Specifying the Path to the Browser Executable](#specifying-the-path-to-the-browser-executable)
    * [Specifying the Path with Command Line Parameters](#specifying-the-path-with-command-line-parameters)
    * [Passing a Remote Browser Connection](#passing-a-remote-browser-connection)
* [screenshots](#screenshots)
* [video](#video)
* [reporter](#reporter)
    * [Specifying the Reporter](#specifying-the-reporter)
    * [Saving the Report to a File](#saving-the-report-to-a-file)
    * [Using Multiple Reporters](#using-multiple-reporters)
    * [Implementing a Custom Stream](#implementing-a-custom-stream)
* [concurrency](#concurrency)
* [startApp](#startapp)
* [clientScripts](#clientscripts)
* [useProxy](#useproxy)
* [tsConfigPath](#tsconfigpath)
* [run](#run)
    * [Cancelling Test Tasks](#cancelling-test-tasks)
    * [Quarantine Mode](#quarantine-mode)
* [stop](#stop)

### src

Configures the test runner to run tests from the specified files.

```text
src(source) → this
```

Parameter | Type                | Description
--------- | ------------------- | ----------------------------------------------------------------------------
`source`  | String &#124; Array | The relative or absolute path to a test fixture file, or several such paths. You can use [glob patterns](https://github.com/isaacs/node-glob#glob-primer) to include (or exclude) multiple files.

TestCafe can run:

* JavaScript, TypeScript and CoffeeScript files that use [TestCafe API](../../test-api/README.md),
* [TestCafe Studio](https://www.devexpress.com/products/testcafestudio/) tests (`.testcafe` files),
* Legacy TestCafe v2015.1 tests.

You do not need to call this function if you specify the [src](../configuration-file.md#src) property in the [configuration file](../configuration-file.md).

*Related configuration file property*: [src](../configuration-file.md#src)

**Examples**

```js
runner.src(['/home/user/js-tests/fixture.js', 'studio-fixture.testcafe']);
```

```js
runner.src(['/home/user/tests/**/*.js', '!/home/user/tests/foo.js']);
```

### filter

Allows you to select which tests should be run.

```text
filter(callback) → this
```

Parameter  | Type                                                                  | Description
---------- | --------------------------------------------------------------------- | ----------------------------------------------------------------
`callback` | `function(testName, fixtureName, fixturePath, testMeta, fixtureMeta)` | The callback that determines if a particular test should be run.

The callback function is called for each test in the files the [src](#src) method specifies.

Return `true` from the callback to include the current test or `false` to exclude it.

The callback function accepts the following arguments:

Parameter     | Type                     | Description
------------- | ------------------------ | ----------------------------------
`testName`    | String                   | The name of the test.
`fixtureName` | String                   | The name of the test fixture.
`fixturePath` | String                   | The path to the test fixture file.
`testMeta`    | Object\<String, String\> | The test metadata.
`fixtureMeta` | Object\<String, String\> | The fixture metadata.

*Related configuration file property*: [filter](../configuration-file.md#filter)

**Example**

```js
runner.filter((testName, fixtureName, fixturePath, testMeta, fixtureMeta) => {
    return fixturePath.startsWith('D') &&
        testName.match(someRe) &&
        fixtureName.match(anotherRe) &&
        testMeta.mobile === 'true' &&
        fixtureMeta.env === 'staging';
});
```

### browsers

Configures the test runner to run tests in the specified browsers.

```text
browsers(browser) → this
```

The `browser` parameter can be any of the following objects or an `Array` of them:

Parameter Type                                                                                        | Description                            | Browser Type
---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------
String &#124; Array                                                                                           | A different browser alias for each browser type. See [Browser Support](../common-concepts/browsers/browser-support.md) for more details.                            | [Local browsers](../common-concepts/browsers/browser-support.md#locally-installed-browsers), [cloud browsers](../common-concepts/browsers/browser-support.md#browsers-in-cloud-testing-services), and [browsers accessed through *browser provider plugins*](../common-concepts/browsers/browser-support.md#nonconventional-browsers).                                                                 |
 `{path: String, cmd: String}`                                                                        | The path to the browser's executable (`path`) and command line parameters (`cmd`). The `cmd` property is optional.                                                     | [Local](../common-concepts/browsers/browser-support.md#locally-installed-browsers) and [portable](../common-concepts/browsers/browser-support.md#portable-browsers) browsers
[BrowserConnection](browserconnection.md)                                                            | The remote browser connection.                                                                                                                                        | [Remote browsers](../common-concepts/browsers/browser-support.md#browsers-on-remote-devices)

You do not need to call this function if you specify the [browsers](../configuration-file.md#browsers) property in the [configuration file](../configuration-file.md).

*Related configuration file property*: [browsers](../configuration-file.md#browsers)

#### Using Browser Aliases

* running local browsers

```js
runner.browsers(['safari', 'chrome']);
```

* running browsers accessed through browser provider plugins

```js
runner.browsers('saucelabs:Chrome@52.0:Windows 8.1');
```

#### Specifying the Path to the Browser Executable

Use the `path:` prefix. Enclose the path in backticks if it contains spaces.

```js
runner.browsers('path:`C:\\Program Files\\Internet Explorer\\iexplore.exe`');
```

#### Specifying the Path with Command Line Parameters

```js
runner.browsers({
    path: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    cmd: '--new-window'
});
```

#### Headless Mode, Device Emulation and User Profiles

You can add postfixes to browser aliases to run tests in the [headless mode](../common-concepts/browsers/testing-in-headless-mode.md), use [Chrome device emulation](../common-concepts/browsers/using-chrome-device-emulation.md) or [user profiles](../common-concepts/browsers/user-profiles.md).

```js
runner.browsers('chrome:headless');
```

For portable browsers, use the browser alias followed by the path to an executable.

```js
runner.browsers('firefox:/home/user/apps/firefox.app:userProfile');
```

> The `path:` prefix does not support postfixes.

#### Passing a Remote Browser Connection

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

### screenshots

Enables TestCafe to take screenshots of the tested webpages.

```text
screenshots(path [, takeOnFails, pathPattern]) → this
```

Parameter                  | Type    | Description                                                                   | Default
-------------------------- | ------- | ----------------------------------------------------------------------------- | -------
`path`                     | String  | The base path where the screenshots are saved. Note that to construct a complete path to these screenshots, TestCafe uses the default [path patterns](../common-concepts/screenshots-and-videos.md#default-path-patterns). You can override these patterns using the method's `screenshotPathPattern` parameter.
`takeOnFails`&#160;*(optional)* | Boolean | Specifies if screenshots should be taken automatically when a test fails. | `false`
`sceenshotPathPattern`&#160;*(optional)* | String | The pattern to compose screenshot files' relative path and name. See [Path Pattern Placeholders](../common-concepts/screenshots-and-videos.md#path-pattern-placeholders) for information about the available placeholders.

> Important! TestCafe does not take screenshots if the `screenshots` function is not called.

See [Screenshots](../common-concepts/screenshots-and-videos.md#screenshots) for details.

*Related configuration file properties*:

* [screenshotPath](../configuration-file.md#screenshotpath)
* [takeScreenshotsOnFails](../configuration-file.md#takescreenshotsonfails)
* [screenshotPathPattern](../configuration-file.md#screenshotpathpattern)

**Example**

```js
runner.screenshots('reports/screenshots/', true, '${DATE}_${TIME}/test-${TEST_INDEX}/${USERAGENT}/${FILE_INDEX}.png');
```

### video

Enables TestCafe to record videos of test runs.

```text
video(path [, options, encodingOptions]) → this
```

Parameter                | Type                        | Description
------------------------ | --------------------------- | -----------
`path`                   | String                      | The base directory where videos are saved. Relative paths to video files are composed according to [path patterns](../common-concepts/screenshots-and-videos.md#default-path-patterns). You can also use the `options.pathPattern` property to specify a custom pattern.
`options`&#160;*(optional)* | Object | Options that define how videos are recorded. See [Basic Video Options](../common-concepts/screenshots-and-videos.md#basic-video-options) for a list of options.
`encodingOptions`&#160;*(optional)* | Object | Options that specify video encoding. You can pass all the options supported by the FFmpeg library. Refer to [the FFmpeg documentation](https://ffmpeg.org/ffmpeg.html#Options) for information about the available options.

See [Record Videos](../common-concepts/screenshots-and-videos.md#record-videos) for details.

*Related configuration file properties*:

* [videoPath](../configuration-file.md#videopath)
* [videoOptions](../configuration-file.md#videooptions)
* [videoEncodingOptions](../configuration-file.md#videoencodingoptions)

**Example**

```js
runner.video('reports/videos/', {
    singleFile: true,
    failedOnly: true,
    pathPattern: '${TEST_INDEX}/${USERAGENT}/${FILE_INDEX}.mp4'
}, {
    r: 20,
    aspect: '4:3'
});
```

### reporter

Configures TestCafe's reporting feature.

```text
reporter(name, output) → this
reporter([ name | { name, output }]) → this
```

Parameter                | Type                        | Description                                     | Default
------------------------ | --------------------------- | ----------------------------------------------- | --------
`name`                   | String              | The name of the [reporter](../common-concepts/reporters.md) to use.
`output`&#160;*(optional)* | String &#124; Writable Stream implementer | The file path where the report is written or the output stream. | `stdout`

To use a single reporter, specify a reporter name and, optionally, an output target as the second parameter.

To use multiple reporters, pass an array to this method. This array can include both strings (the reporter name) and `{ name, output }` objects (if you wish to specify the output target). See examples below.

Note that if you use multiple reporters, only one can write to `stdout`.

*Related configuration file property*: [reporter](../configuration-file.md#reporter)

#### Specifying the Reporter

```js
runner.reporter('minimal');
```

#### Saving the Report to a File

```js
runner.reporter('xunit', 'reports/report.xml');
```

#### Using Multiple Reporters

```js
runner.reporter(['spec', {
    name: 'json',
    output: 'reports/report.json'
}]);
```

#### Implementing a Custom Stream

```js
class MyStream extends stream.Writable {
    _write(chunk, encoding, next) {
        doSomething(chunk);
        next();
    }
}

const stream = new MyStream();
runner.reporter('json', stream);
```

You can also build your own reporter. Use a [dedicated Yeoman generator](https://github.com/DevExpress/generator-testcafe-reporter) to scaffold out a [reporter plugin](../../extending-testcafe/reporter-plugin/README.md).

### concurrency

Specifies that tests should run concurrently.

```text
concurrency(n) → this
```

TestCafe opens `n` instances of the same browser and creates a pool of browser instances.
Tests are run concurrently against this pool, that is, each test is run in the first available instance.

The `concurrency` function takes the following parameters:

Parameter | Type    | Description
--------- | ------- | --------
`n`  | Number | The number of browser instances that are invoked.

See [Concurrent Test Execution](../common-concepts/concurrent-test-execution.md) to learn more about concurrent test execution.

*Related configuration file property*: [concurrency](../configuration-file.md#concurrency)

The following example shows how to run tests in three Chrome instances:

```js
runner
    .browsers('chrome')
    .concurrency(3);
```

### startApp

Specifies a shell command that is executed before running tests. Use it to launch or deploy the application that is tested.

```text
async startApp(command, initDelay) → this
```

After the testing is finished, the application is automatically terminated.

The `startApp` function takes the following parameters:

Parameter         | Type    | Description   Default
----------------- | ------- | -------- | -------
`command`                     | String | The shell command to be executed.
`initDelay`&#160;*(optional)* | Number | The amount of time (in milliseconds) allowed for the command to initialize the tested application. | `1000`

> TestCafe adds `node_modules/.bin` to `PATH` so that you can use binaries the locally installed dependencies provide without prefixes.

*Related configuration file properties*:

* [appCommand](../configuration-file.md#appcommand)
* [appInitDelay](../configuration-file.md#appinitdelay)

**Example**

```js
runner.startApp('node server.js', 4000);
```

### clientScripts

Injects scripts into pages visited during the tests. Use this method to introduce client-side mock functions or helper scripts.

```text
async clientScripts( script[, script2[, ...[, scriptN]]] ) → this
```

Parameter | Type                | Description
--------- | ------------------- | ------------
`script`, `script2`, `scriptN`  | String &#124; Object &#124; Array | Scripts to inject into the tested pages. See [Provide Scripts to Inject](common-concepts/inject-scripts-into-tested-pages.md#provide-scripts-to-inject) to learn how to specify them.

> Relative paths resolve from the current working directory.

You can use the [page](common-concepts/inject-scripts-into-tested-pages.md#provide-scripts-for-specific-pages) option to specify pages into which scripts should be injected. Otherwise, TestCafe injects scripts into all pages visited during the test run.

```js
runner.clientScripts('assets/jquery.js');
```

```js
runner.clientScripts([
    {
        module: 'lodash'
    },
    {
        path: 'scripts/react-helpers.js',
        page: 'https://myapp.com/page/'
    }
]);
```

The [fixture.clientScripts](../../test-api/test-code-structure.md#inject-scripts-into-tested-pages) and [test.clientScripts](../../test-api/test-code-structure.md#inject-scripts-into-tested-pages) methods allow you to inject scripts into pages visited during an individual fixture or test.

See [Inject Scripts into Tested Pages](common-concepts/inject-scripts-into-tested-pages.md) for more information.

*Related configuration file property*: [clientScripts](../configuration-file.md#clientscripts)

### useProxy

Specifies the proxy server used in your local network to access the Internet. Allows you to bypass the proxy when accessing specific resources.

```text
async useProxy(host [, bypassRules]) → this
```

Parameter | Type   | Description
--------- | ------ | ---------------------
`host`    | String | The proxy server host.
`bypassRules`&#160;*(optional)* | String &#124; Array | A set of rules that specify which resources are accessed bypassing the proxy.

If you access the Internet through a proxy server, use the `useProxy` method to specify its host.

When using a proxy server, you may still need to access local or external resources directly. In this instance, provide their URLs in the `bypassRules` option.

The `bypassRules` parameter takes one or several URLs that require direct access. You can replace parts of the URL with the `*` wildcard that corresponds to a string of any length. Wildcards at the beginning and end of the rules can be omitted (`*.mycompany.com` and `.mycompany.com` have the same effect).

*Related configuration file properties*:

* [proxy](../configuration-file.md#proxy)
* [proxyBypass](../configuration-file.md#proxybypass)

**Examples**

The following example shows how to use the proxy server at `proxy.corp.mycompany.com`:

```js
runner.useProxy('proxy.corp.mycompany.com');
```

In the example below, the proxy server address is `172.0.10.10:8080` and two resources at `localhost:8080` and `internal-resource.corp.mycompany.com` are accessed directly.

```js
runner.useProxy('172.0.10.10:8080', ['localhost:8080', 'internal-resource.corp.mycompany.com']);
```

The `*.mycompany.com` proxy bypass rule means that all URLs in `mycompany.com` subdomains are accessed directly.

```js
runner.useProxy('proxy.corp.mycompany.com', '*.mycompany.com');
```

You can also use the proxy host to specify authentication credentials.

```js
runner.useProxy('username:password@proxy.mycorp.com');
```

### tsConfigPath

Enables TestCafe to use a custom [TypeScript configuration file](../../test-api/typescript-support.md#customize-compiler-options) and specifies its location.

```text
async tsConfigPath(path) → this
```

Parameter | Type   | Description
--------- | ------ | ---------------------
`path`    | String | The absolute or relative path to the TypeScript configuration file. Relative paths resolve from the current directory (the directory from which you run TestCafe).

```js
runner.tsConfigPath('/Users/s.johnson/testcafe/tsconfig.json');
```

*Related configuration file property*: [tsConfigPath](../configuration-file.md#tsconfigpath)

### run

Runs tests according to the current configuration. Returns the number of failed tests.

```text
async run(options) → Promise<Number>
```

Before TestCafe runs tests, it reads settings from the `.testcaferc.json` [configuration file](../configuration-file.md) if this file exists. Then it applies settings specified in the programming API. API settings override values from the configuration file in case they differ. TestCafe prints information about every overridden property in the console.

> Important! Make sure to keep the browser tab that is running tests active. Do not minimize the browser window.
> Inactive tabs and minimized browser windows switch to a lower resource consumption mode
> where tests are not guaranteed to execute correctly.

You can pass the following options to the `runner.run` function.

Parameter         | Type    | Description                                                                                                                                                                           | Default
----------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------
`skipJsErrors`    | Boolean | Defines whether to continue running a test after a JavaScript error occurs on a page (`true`), or consider such a test failed (`false`).                                              | `false`
`skipUncaughtErrors` | Boolean | Defines whether to continue running a test after an uncaught error or unhandled promise rejection occurs on the server (`true`), or consider such a test failed (`false`).                                              | `false`
`quarantineMode`  | Boolean | Defines whether to enable the [quarantine mode](#quarantine-mode).                                                                                                                    | `false`
`debugMode`       | Boolean | Specifies if tests run in the debug mode. If this option is enabled, test execution is paused before the first action or assertion allowing you to invoke the developer tools and debug. In the debug mode, you can execute the test step-by-step to reproduce its incorrect behavior. You can also use the **Unlock page** switch in the footer to unlock the tested page and interact with its elements. | `false`
`debugOnFail`     | Boolean | Specifies whether to enter the debug mode when a test fails. If enabled, the test is paused at the moment it fails, so that you can explore the tested page to determine what caused the failure. | `false`
`selectorTimeout` | Number  | Specifies the time (in milliseconds) within which [selectors](../../test-api/selecting-page-elements/selectors/README.md) make attempts to obtain a node to be returned. See [Selector Timeout](../../test-api/selecting-page-elements/selectors/using-selectors.md#selector-timeout). | `10000`
`assertionTimeout` | Number  | Specifies the time (in milliseconds) within which TestCafe makes attempts  to successfully execute an [assertion](../../test-api/assertions/README.md) if [a selector property](../../test-api/selecting-page-elements/selectors/using-selectors.md#define-assertion-actual-value) or a [client function](../../test-api/obtaining-data-from-the-client/README.md) was passed as an actual value. See [Smart Assertion Query Mechanism](../../test-api/assertions/README.md#smart-assertion-query-mechanism). | `3000`
`pageLoadTimeout` | Number  |  Specifies the time (in milliseconds) TestCafe waits for the `window.load` event to fire after the `DOMContentLoaded` event. After the timeout passes or the `window.load` event is raised (whichever happens first), TestCafe starts the test. You can set this timeout to `0` to skip waiting for `window.load`. | `3000`
`speed`           | Number  | Specifies the test execution speed. A number between `1` (fastest) and `0.01` (slowest). If an [individual action's](../../test-api/actions/action-options.md#basic-action-options) speed is also specified, the action speed setting overrides the test speed. | `1`
`stopOnFirstFail`    | Boolean | Defines whether to stop a test run if a test fails. You do not need to wait for all the tests to finish to focus on the first error. | `false`
`disablePageCaching` | Boolean | Prevents the browser from caching the page content. When navigation to a cached page occurs in [role code](../../test-api/authentication/user-roles.md), local and session storage content is not preserved. Set `disablePageCaching` to `true` to retain the storage items after navigation. For more information, see [Troubleshooting: Test Actions Fail After Authentication](../../test-api/authentication/user-roles.md#test-actions-fail-after-authentication). You can also disable page caching [for an individual fixture or test](../../test-api/test-code-structure.md#disable-page-caching).

After all tests are finished, call the [testcafe.close](testcafe.md#close) function to stop the TestCafe server.

*Related configuration file properties*:

* [skipJsErrors](../configuration-file.md#skipjserrors)
* [skipUncaughtErrors](../configuration-file.md#skipuncaughterrors)
* [quarantineMode](../configuration-file.md#quarantinemode)
* [debugMode](../configuration-file.md#debugmode)
* [debugOnFail](../configuration-file.md#debugonfail)
* [selectorTimeout](../configuration-file.md#selectortimeout)
* [assertionTimeout](../configuration-file.md#assertiontimeout)
* [pageLoadTimeout](../configuration-file.md#pageloadtimeout)
* [speed](../configuration-file.md#speed)
* [stopOnFirstFail](../configuration-file.md#stoponfirstfail)
* [disablePageCaching](../configuration-file.md#disablepagecaching)

**Example**

```js
const createTestCafe = require('testcafe');
let testcafe         = null;

createTestCafe('localhost', 1337, 1338)
    .then(tc => {
        testcafe     = tc;
        const runner = testcafe.createRunner();

        return runner.run({
            skipJsErrors: true,
            quarantineMode: true,
            selectorTimeout: 50000,
            assertionTimeout: 7000,
            pageLoadTimeout: 8000,
            speed: 0.1,
            stopOnFirstFail: true
        });
    })
    .then(failed => {
        console.log('Tests failed: ' + failed);
        testcafe.close();
    })
    .catch(error => { /* ... */ });
```

If a browser stops responding while it executes tests, TestCafe restarts the browser and reruns the current test in a new browser instance.
If the same problem occurs with this test two more times, the test run finishes and an error is thrown.

> When you use a [LiveModeRunner](livemoderunner.md), you can call the `runner.run` method only once. In rare cases when you need multiple live mode sessions running in parallel, you can create several [TestCafe server instances](testcafe.md).

#### Cancelling Test Tasks

You can stop an individual test task at any moment by cancelling the corresponding promise.

```js
const taskPromise = runner
    .src('tests/fixture1.js')
    .browsers([remoteConnection, 'chrome'])
    .reporter('json')
    .run();

taskPromise.cancel();
```

You can also cancel all pending tasks at once using the [runner.stop](#stop) function.

#### Quarantine Mode

The quarantine mode is designed to isolate *non-deterministic* tests (that is, tests that pass and fail without any apparent reason) from the other tests.

When the quarantine mode is enabled, tests run according to the following logic:

1. A test runs at the first time. If it passes, TestCafe proceeds to the next test.
2. If the test fails, it runs again until it passes or fails three times.
3. The most frequent outcome is recorded as the test result.
4. If the test result differs between test runs, the test is marked as unstable.

> Note that it increases the test task's duration if you enable quarantine mode on your test machine because failed tests are executed three to five times.

See Martin Fowler's [Eradicating Non-Determinism in Tests](http://martinfowler.com/articles/nonDeterminism.html) article for more information about non-deterministic tests.

### stop

Stops all the pending test tasks.

```text
async stop()
```

You can also stop an individual pending task by [cancelling the corresponding promise](#cancelling-test-tasks).
