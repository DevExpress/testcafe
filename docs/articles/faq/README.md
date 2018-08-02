---
layout: faq
title: Frequently Asked Questions
permalink: /faq/
---
# FAQ

* [General Questions](#general-questions)
  * [I have heard that TestCafe does not use Selenium. How does it operate?](#i-have-heard-that-testcafe-does-not-use-selenium-how-does-it-operate)
  * [What is the difference between a paid and an open-source TestCafe version? What is TestCafe Studio?](#what-is-the-difference-between-a-paid-and-an-open-source-testcafe-version-what-is-testcafe-studio)
  * [Which browsers does TestCafe support? What are the exact supported versions?](#which-browsers-does-testcafe-support-what-are-the-exact-supported-versions)
  * [Can I use third-party modules in tests?](#can-i-use-third-party-modules-in-tests)
  * [How do I work with configuration files and environment variables?](#how-do-i-work-with-configuration-files-and-environment-variables)
* [Troubleshooting](#troubleshooting)
  * [I have installed TestCafe, but I cannot run it. What should I do?](#i-have-installed-testcafe-but-i-cannot-run-it-what-should-i-do)
  * [When I run a TestCafe test, I get an unexpected error. What can cause that?](#when-i-run-a-testcafe-test-i-get-an-unexpected-error-what-can-cause-that)
  * [I have installed TestCafe plugins but they do not work. What have I done wrong?](#i-have-installed-testcafe-plugins-but-they-do-not-work-what-have-i-done-wrong)
  * [My test fails because TestCafe could not find the required webpage element. Why does this happen?](#my-test-fails-because-testcafe-could-not-find-the-required-webpage-element-why-does-this-happen)

## General Questions

### I have heard that TestCafe does not use Selenium. How does it operate?

Unlike most testing solutions, TestCafe is not built on Selenium.
This allows us to implement features you cannot find in Selenium-based tools
(for example, testing on mobile devices, user roles, automatic waiting, etc.).

TestCafe uses a [URL-rewriting proxy](https://github.com/DevExpress/testcafe-hammerhead)
which allows it to work without the WebDriver.
This proxy injects the driver script that emulates user actions into the tested page.

You can read about this in our [forum](https://testcafe-discuss.devexpress.com/t/why-not-use-selenium/47).
Feel free to ask for more details.

### What is the difference between a [paid](https://testcafe.devexpress.com) and an [open-source](https://devexpress.github.io/testcafe) TestCafe version? What is [TestCafe Studio](https://testcafe-studio.devexpress.com/)?

All three versions share the same core features:

* No need for WebDriver, browser plugins or other tools.
* Cross-platform and cross-browser out of the box.

[TestCafe](https://testcafe.devexpress.com)  
*2013, commercial web application*  

* Visual Test Recorder and web GUI to create, edit and run tests.
* You can record tests or edit them as JavaScript code.

[TestCafe](https://devexpress.github.io/testcafe)  
*2016,  free and open-source node.js application*

* You can write tests in the latest JavaScript or TypeScript.
* Clearer and more flexible [API](https://devexpress.github.io/testcafe/documentation/test-api/) supports ES6 and [PageModel pattern](https://devexpress.github.io/testcafe/documentation/recipes/using-page-model.html).
* More stable tests due to the [Smart Assertion Query Mechanism](https://devexpress.github.io/testcafe/documentation/test-api/assertions/#smart-assertion-query-mechanism).
* Tests run faster due to improved [Automatic Waiting Mechanism](https://devexpress.github.io/testcafe/documentation/test-api/waiting-for-page-elements-to-appear.html) and [Concurrent Test Execution](https://devexpress.github.io/testcafe/documentation/using-testcafe/common-concepts/concurrent-test-execution.html).
* Easy integration: it is a node.js solution with CLI and reporters for popular CI systems.
* You can extend it with [plugins](https://github.com/DevExpress/testcafe#plugins) and other Node.js modules.

[TestCafe Studio](https://testcafe-studio.devexpress.com)  
*2018, commercial desktop application*  

* Based on the open-source TestCafe, and supports its major features.
* You can record tests or edit them as JavaScript or TypeScript code.
* New [Visual Test Recorder](https://testcafe-studio.devexpress.com/documentation/guides/record-tests/) and [IDE-like GUI](https://testcafe-studio.devexpress.com/documentation/guides/write-test-code.html) to record, edit, run and debug tests.
* Currently available as a free preview version.

### Which browsers does TestCafe support? What are the exact supported versions?

You can find a list of supported browsers in
[our documentation](../documentation/using-testcafe/common-concepts/browsers/browser-support.md).
TestCafe is tested against the two latest versions of each browser
except for the browsers whose versions are specified explicitly in this list.

We do not use the most recent JavaScript features in TestCafe code,
which means it should work with any browser with HTML5 support released in the last three years.

### Can I use third-party modules in tests?

You can import third-party modules to test files in the same way as a regular node.js module.

On the server side, use the `import` statement.

```js
import fs from 'fs';

fixture `fixture`
   .page('http://localhost/testcafe/');

test('test', async t => {
   var filePath = 'filepath.js';

   await t.expect(fs.existsSync(filePath)).ok();
});
```

On the client side, use `t.eval` to include the desired module in the test.
Then you can use this module inside client functions and selectors.

```js
test('test', async t => {
    // eval jquery code to add jQuery to the page
    await t.eval(new Function(fs.readFileSync('./jquery.js').toString()));

    var clientFunction = ClientFunction(() => {
        // You can use $ here
        return $('div').text();
    });

    var text = await clientFunction();
});
```

### How do I work with configuration files and environment variables?

TestCafe works without any configuration.
It does not have any config files where you can place custom variables.
However, you can introduce your own configuration file and import it to the test code.

For example, you need to pass a website's base URL to test code. In this instance, you can create the following `config.json` file:

```json
{
    "baseUrl": "http://localhost/testcafe"
}
```

In the test code, import it as you would do with a regular JavaScript module.

```js
import config from './config';

fixture `Fixture`
    .page `${config.baseUrl}/test1/index.html`;
```

Alternatively, you can use custom command line parameters or environment variables.

The following command passes the `env` argument to the test code:

```sh
testcafe chrome test.js --env=development
```

In the test, use an argument parser library (like `minimist`) to parse custom arguments.

```js
import minimist from 'minimist';

const args = minimist(process.argv.slice(2));
const environment = args.env;

fixture('example')
    .page('http://example.com');

test('check environment', async t => {
  console.log('Environment:', environment);
});
```

To set an environment variable use the following command on Windows.

```sh
set DEV_MODE=true
testcafe chrome test.js
```

On macOS, [the workflow is longer](https://stackoverflow.com/questions/135688/setting-environment-variables-in-os-x).

In test code, you can access this variable as `process.env.DEV_MODE`.

## Troubleshooting

### I have installed TestCafe but I cannot run it. What should I do?

**Check your firewall.** First, make sure that your firewall does not block the ports TestCafe uses.
TestCafe chooses free ports automatically by default. Use the
[--ports](../documentation/using-testcafe/command-line-interface.md#--ports-port1port2) command line option
or the [createTestCafe](../documentation/using-testcafe/programming-interface/createtestcafe.md)
API factory function to specify custom ports. After that, check that the firewall does not block these specific ports.

**Check your proxy server**. Another reason for this problem can be the proxy server you use to access the Internet.
If your network is connected to the Web via a proxy, use the
[--proxy](../documentation/using-testcafe/command-line-interface.md#--proxy-host) command line option
or the [useProxy](../documentation/using-testcafe/programming-interface/runner.md#useproxy) API method
to specify the proxy address.

**For Linux check X11.** Also note that if you run TestCafe on Linux,
you need to make sure the system is running the [X11](https://en.wikipedia.org/wiki/X_Window_System) server.
Without X11, you can only run tests in cloud services and headless Google Chrome.
However, if you use the [Xvbf](https://en.wikipedia.org/wiki/Xvfb) server, you can run any other browser in the headless mode.

### When I run a TestCafe test, I get an unexpected error. What can cause that?

**JavaScript errors.** The most common reason for this is a JavaScript error on the tested page.
Load this page in the browser, open the console and see if the page has any errors.
In case there are errors, you can either fix them or use
the [--skip-js-errors](../documentation/using-testcafe/command-line-interface.md#-e---skip-js-errors) flag
to tell TestCafe to skip them.

**Browser extensions.** If this does not help, try running the problematic test in incognito mode.
You can do this by adding an appropriate flag after the browser name.

```sh
testcafe "chrome -incognito" tests/test.js
```

```sh
testcafe "firefox –private-window" tests/test.js
```

If the test runs successfully, it might be browser extensions causing the issue.
Try disabling them one by one and restart the test in the regular mode at each iteration.
This way you can find out which extension prevents the test from running.

**Third-party modules.** In rare cases, third-party modules can be the cause.
If you use a locally installed TestCafe, try installing it globally and running the test
outside of the project to eliminate the influence of third-party modules.

### I have installed TestCafe plugins but they do not work. What have I done wrong?

Plugins should also be installed locally if you are using a locally installed TestCafe.

```sh
npm install --save-dev {pluginName}
```

If you are going to use a global TestCafe installation, or you wish
to use the plugin in other projects as well, install it globally.

```sh
npm install -g {pluginName}
```

### My test fails because TestCafe could not find the required webpage element. Why does this happen?

First, try debugging the tested page with the TestCafe's built-in debugger by adding
the [t.debug()](../documentation/test-api/debugging.md) method to test code.
Then run the test and wait until the browser stops at the breakpoint.
After this, use the browser's development tools to check that:

* the element is present on the page;
* the element is visible (TestCafe considers it visible if it does not have `display` set to `none`,
  `visibility` set to `hidden` or the zero `width` or `height`);
* the element's part targeted by the action is visible (the center of the element by default;
  it can be changed using the
  [`offsetX` and `offsetY`](https://devexpress.github.io/testcafe/documentation/test-api/actions/action-options.html#mouse-action-options)
  parameters);
* the element is not in an `<iframe>` (if it is, use the
  [t.switchToIframe](https://devexpress.github.io/testcafe/documentation/test-api/working-with-iframes.html) method
  to switch to the appropriate `<iframe>`).

Also, try running the test at full screen.
Use the [t.maximizeWindow](../documentation/test-api/actions/resize-window.md#maximizing-the-window)
and [t.resizeWindow](../documentation/test-api/actions/resize-window.md#setting-the-window-size) actions
to control the browser window size. If the test passes, it means your webpage hides
the target element when the window is resized to smaller dimensions.

Finally, try updating TestCafe to the latest version to see if the problem persists.