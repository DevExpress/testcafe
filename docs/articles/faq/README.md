---
layout: docs
title: Frequently Asked Questions
permalink: /faq/
---
# FAQ

* [General Questions](#general-questions)
  * [I've heard that TestCafe doesn't use Selenium under the hood. How does it actually operate?](#ive-heard-that-testcafe-doesnt-use-selenium-under-the-hood-how-does-it-actually-operate)
  * [I've noticed there are two versions of TestCafe: a paid version and an open-source version. Why have two versions and what's the difference between them?](#ive-noticed-there-are-two-versions-of-testcafe-a-paid-version-and-an-open-source-version-why-have-two-versions-and-whats-the-difference-between-them)
  * [Which browsers does TestCafe support? What are the exact supported versions?](#which-browsers-does-testcafe-support-what-are-the-exact-supported-versions)
  * [Can I use third-party modules in tests?](#can-i-use-third-party-modules-in-tests)
  * [How do I work with configuration files and environment variables?](#how-do-i-work-with-configuration-files-and-environment-variables)
* [Troubleshooting](#troubleshooting)
  * [I have installed TestCafe but I cannot run it. What's your advice?](#i-have-installed-testcafe-but-i-cannot-run-it-whats-your-advice)
  * [When I run a TestCafe test, I get an unexpected error. Do you know any possible reasons?](#when-i-run-a-testcafe-test-i-get-an-unexpected-error-do-you-know-any-possible-reasons)
  * [I have installed TestCafe plugins but they do not work. What have I done wrong?](#i-have-installed-testcafe-plugins-but-they-do-not-work-what-have-i-done-wrong)
  * [My test fails because TestCafe could not find the required webpage element. What could go wrong?](#my-test-fails-because-testcafe-could-not-find-the-required-webpage-element-what-could-go-wrong)

## General Questions

### I've heard that TestCafe doesn't use Selenium under the hood. How does it actually operate?

Unlike most testing solutions, TestCafe isn't built on top of Selenium.
This allows us to implement the unique features you won't find in Selenium-based tools
(e.g., testing on mobile devices, user roles, automatic waiting, etc).

You may wonder how TestCafe manages to work without the WebDriver.
Under the hood, TestCafe uses a [URL-rewriting proxy](https://github.com/DevExpress/testcafe-hammerhead).
This proxy injects the driver script that emulates user actions right into the tested page.

You can read more about our motivations on our [forum](https://testcafe-discuss.devexpress.com/t/why-not-use-selenium/47).
Don't hesitate to ask for more details.

### I've noticed there are two versions of TestCafe: a [paid version](https://testcafe.devexpress.com) and an [open-source version](https://devexpress.github.io/testcafe). Why have two versions and what's the difference between them?

Historically, TestCafe first appeared as a paid standalone tool. Beside the test runner,
it featured the [Control Panel](https://testcafe.devexpress.com/Documentation/Using_TestCafe/Control_Panel/),
a visual interface for managing your tests (creating, modifying, running), and an innovative
[Visual Test Recorder](https://testcafe.devexpress.com/Documentation/Using_TestCafe/Visual_Test_Recorder/)
that allowed you to record tests by pointing and clicking through the test scenario in the browser.

This version was actively developed until 2015 when we decided to release its core as an open-source project.
The last major release of the paid version happened in the summer 2015, which was v15.1.
After that, it was switched to a maintenance-only mode. The website at [https://testcafe.devexpress.com](https://testcafe.devexpress.com)
currently documents the latest paid version.

In late 2016, we have released an open-source TestCafe version under the same name – just ***TestCafe***.
This version contains a lot of new functionality and many important changes compared to the core of the last paid version.

* it has a completely new API and offers a new approach to writing tests;
* it has no UI to manage and run tests. You can run test from the CLI or from a node.js module;
* it's more convenient to integrate into node.js development workflow
* it has some new features (like es6 support, flexible selectors and smart assertions, authentication features etc.)

You can learn more about the open-source version at [https://devexpress.github.io/testcafe](https://devexpress.github.io/testcafe).

However, we didn't abandon our aspirations to create a competitive proprietary product.
We plan to release a completely new commercial version based on the revised open-source TestCafe.
Stay tuned to [https://testcafe.devexpress.com](https://testcafe.devexpress.com) to keep in touch
about the new product that will be called ***TestCafe Studio***.

### Which browsers does TestCafe support? What are the exact supported versions?

We test TestCafe against a limited number of browsers. We call these browsers *officially* supported.
You can find the list of these browsers in [our documentation](../documentation/using-testcafe/common-concepts/browser-support.md).

At the same time, TestCafe should work with almost every modern browser with extensive support for HTML5.
You can check if TestCafe works in the browser of your interest by yourself.

As to the exact browser versions, we test TestCafe against two newest versions
of each officially supported browser (unless the exact version is specified explicitly
in the supported browser list). However, TestCafe actually works with many older versions
since we usually refrain from using cutting edge features in TestCafe code. In fact,
TestCafe should work in any officially supported browser released in the last three years.

### Can I use third-party modules in tests?

Yes, you can import them to test files just like you would do with a regular node.js module.

On the server side, you only need to use the `import` statement.

```js
import fs from 'fs';

fixture `fixture`
   .page('http://localhost/testcafe/');

test('test', async t => {
   // var filePath = ...;
   await t.expect(fs.existsSync(filePath)).ok();
});
```

On the client side, use `t.eval` to include the desired module in the test.
Then you can use this module inside client functions and selectors.

```sh
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

As TestCafe works with zero configuration, it does not have any config files
where you can place your custom variables. However, you can always introduce
your own configuration file and import it to test code.

For example, assume you need to pass a website's base URL to test code.
In this instance, you may create the following `config.json` file.

```json
{
    "baseUrl": "http://localhost/testcafe"
}
```

In test code, import it as you would do with a regular JavaScript module.

```js
import config from './config';

fixture `Fixture`
    .page `${config.baseUrl}/test1/index.html`;
```

As an alternative, you may want to use custom command line parameters or environment variables.

The following command passes the `env` argument to the test code.

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

In test code, you can access this variable as `process.env.DEV_MODE`.

## Troubleshooting

### I have installed TestCafe but I cannot run it. What's your advice?

First, make sure that your firewall does not block ports used by TestCafe.
By default, TestCafe chooses free ports automatically. That is why it can be
hard to determine which ports it actually uses. In this instance, use
the [--ports](../documentation/using-testcafe/command-line-interface.md#--ports-port1port2) command line option
or the [createTestCafe](../documentation/using-testcafe/programming-interface/createtestcafe.md)
API factory function to specify custom ports. After that, you can check that these specific ports are not blocked by the firewall.

Another reason for this problem can be the proxy server you use to access the Internet.
If your network is connected to the Web via a proxy, use
the [--proxy](../documentation/using-testcafe/command-line-interface.md#--proxy-host) command line option
or the [useProxy](../documentation/using-testcafe/programming-interface/runner.md#useproxy) API method
to specify the proxy address.

Please also note that if you run TestCafe on Linux, you need to make sure the system is running
the [X11](https://en.wikipedia.org/wiki/X_Window_System) server.
Without X11, you can only run tests in cloud services and headless Google Chrome.
However, if you use the [Xvbf](https://en.wikipedia.org/wiki/Xvfb) server, you can run any other browser in the headless mode.

### When I run a TestCafe test, I get an unexpected error. Do you know any possible reasons?

The most common reason for this is a JavaScript error on the tested page.
Open this page in the browser, pop up the console and see if the page has any errors.
In case there are errors, you can either fix them or use
the [--skip-js-errors](../documentation/using-testcafe/command-line-interface.md#-e---skip-js-errors) flag
to tell TestCafe to skip them.

If this does not help, try running the problematic test in the incognito mode.
You can do this by adding an appropriate flag after the browser name.

```sh
testcafe "chrome -incognito" tests/test.js
```

```sh
testcafe "firefox –private-window" tests/test.js
```

If the test runs successfully, the issue may be caused by browser extensions.
Try disabling them one by one and restart the test in the regular mode at each iteration.
This way you will find out which extension prevents the test from running.

In rare cases, third-party modules can cause this kind of error.
If you use a locally installed TestCafe, try installing it globally and running
the test outside of the project to eliminate the influence of third-party modules.

### I have installed TestCafe plugins but they do not work. What have I done wrong?

If you are using a locally installed TestCafe, plugins should also be installed locally.

```sh
npm install --save-dev {pluginName}
```

If you are going to use a global TestCafe installation or you wish to use the plugin in other projects as well, install it globally.

```sh
npm install -g {pluginName}
```

### My test fails because TestCafe could not find the required webpage element. What could go wrong?

To determine the cause of this issue, first try debugging the tested page with TestCafe built-in debugger.
To do this, add the [t.debug](../documentation/test-api/debugging.md) method to test code.
Then run the test and wait until the browser stops at the breakpoint.
After this, use the browser's development tools to check that:

* the element is present on the page;
* the element is visible (TestCafe considers it visible if it does not have `display` set to `none`,
  `visibility` set to `hidden` or the zero `width` or `height`);
* the element's part targeted by the action is visible
  (by default, this is the center of the element; it can be changed by using
  the [`offsetX` and `offsetY`](https://devexpress.github.io/testcafe/documentation/test-api/actions/action-options.html#mouse-action-options)
  parameters);
* the element is not in an `<iframe>` (if it is, use the
  [t.switchToIframe](https://devexpress.github.io/testcafe/documentation/test-api/working-with-iframes.html) method
  to switch to the appropriate `<iframe>`).

In addition, try running the test at full screen. If it passes, then your webpage hides
the target element when it is resized to smaller dimensions.

Finally, try updating TestCafe to the latest version to see if the problem persists.