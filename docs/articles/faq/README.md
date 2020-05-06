---
layout: faq
title: Frequently Asked Questions
permalink: /faq/
---
# FAQ

* [General Questions](#general-questions)
  * [I have heard that TestCafe does not use Selenium. How does it operate?](#i-have-heard-that-testcafe-does-not-use-selenium-how-does-it-operate)
  * [What is the difference between TestCafe Studio and open-source TestCafe?](#what-is-the-difference-between-testcafe-studio-and-open-source-testcafe)
  * [Has TestCafe v2015.1 been deprecated?](#has-testcafe-v20151-been-deprecated)
  * [Which browsers does TestCafe support? What are the exact supported versions?](#which-browsers-does-testcafe-support-what-are-the-exact-supported-versions)
  * [Can I use third-party modules in tests?](#can-i-use-third-party-modules-in-tests)
  * [How do I work with configuration files and environment variables?](#how-do-i-work-with-configuration-files-and-environment-variables)
  * [How do I identify elements with dynamic IDs?](#how-do-i-identify-elements-with-dynamic-ids)
* [Troubleshooting](#troubleshooting)
  * [I have installed TestCafe, but I cannot run it. What should I do?](#i-have-installed-testcafe-but-i-cannot-run-it-what-should-i-do)
  * [When I run a TestCafe test, I get an unexpected error. What can cause that?](#when-i-run-a-testcafe-test-i-get-an-unexpected-error-what-can-cause-that)
  * [I have installed TestCafe plugins but they do not work. What have I done wrong?](#i-have-installed-testcafe-plugins-but-they-do-not-work-what-have-i-done-wrong)
  * [My test fails because TestCafe could not find the required webpage element. Why does this happen?](#my-test-fails-because-testcafe-could-not-find-the-required-webpage-element-why-does-this-happen)
  * [TestCafe reports that a request has failed. What are the possible reasons?](#testcafe-reports-that-a-request-has-failed-what-are-the-possible-reasons)

## General Questions

### I have heard that TestCafe does not use Selenium. How does it operate?

Unlike most testing solutions, TestCafe is not built on Selenium.
This allows us to implement features you cannot find in Selenium-based tools
(for example, testing on mobile devices, user roles, automatic waiting, etc.).

TestCafe uses a [URL-rewriting proxy](https://github.com/DevExpress/testcafe-hammerhead)
which allows it to work without the WebDriver.
This proxy injects the driver script that emulates user actions into the tested page.

You can read about this in our [forum](https://testcafe-discuss.devexpress.com/t/why-not-use-selenium/47).

### What is the difference between [TestCafe Studio](https://www.devexpress.com/products/testcafestudio/) and [open-source TestCafe](https://devexpress.github.io/testcafe)?

TestCafe Studio is a testing IDE built on top of the open-source TestCafe engine. It simplifies the way you record tests and helps you delegate testing to a QA team that does not want to write JavaScript.

Read the following article to learn how TestCafe Studio could fit into your workflow: [What's Better than TestCafe? TestCafe Studio](https://www.devexpress.com/products/testcafestudio/qa-end-to-end-web-testing.xml).

The table below compares TestCafe and TestCafe Studio:

| &nbsp; | [TestCafe](https://devexpress.github.io/testcafe) | [TestCafe Studio](https://www.devexpress.com/products/testcafestudio/)  |
| ------ |:-------------------------------------------------:|:-----------------------------------------------------------------------:|
| No need for WebDriver, browser plugins or other tools | &#10003; | &#10003; |
| Cross-platform and cross-browser out of the box | &#10003; | &#10003; |
| Write tests in the latest JavaScript or TypeScript | &#10003; | &#10003; |
| Clear and flexible API supports ES6 and [PageModel pattern](../documentation/guides/concepts/page-model.md) | &#10003; | &#10003; |
| Stable tests due to the [Smart Assertion Query Mechanism](../documentation/guides/basic-guides/assert.md#smart-assertion-query-mechanism) | &#10003; | &#10003; |
| Tests run fast due to intelligent [Automatic Waiting Mechanism](../documentation/guides/concepts/built-in-wait-mechanisms.md) and [Concurrent Test Execution](../documentation/guides/basic-guides/run-tests.md#run-tests-concurrently) | &#10003; | &#10003; |
| Custom reporter plugins | &#10003; | &#10003; |
| Use third-party Node.js modules in test scripts | &#10003; | &#10003; |
| Integration with popular CI systems | &#10003; | &nbsp;&#10003;\* |
| Free and open-source | &#10003; | &nbsp; |
| [Visual Test Recorder](https://docs.devexpress.com/TestCafeStudio/400165/guides/record-tests) | &nbsp; | &#10003; |
| [Interactive Test Editor](https://docs.devexpress.com/TestCafeStudio/400190/user-interface/test-editor) | &nbsp; | &#10003; |
| [Automatic Selector Generation](https://docs.devexpress.com/TestCafeStudio/400407/test-actions/element-selectors#auto-generated-element-selectors) | &nbsp; | &#10003; |
| [Run Configuration Manager](https://docs.devexpress.com/TestCafeStudio/400189/user-interface/run-configurations-dialog) | &nbsp; | &#10003; |
| [IDE-like GUI](https://docs.devexpress.com/TestCafeStudio/400181/user-interface/code-editor) | &nbsp; | &#10003; |

\* You can use open-source TestCafe to run TestCafe Studio tests in CI systems.

### Has [TestCafe v2015.1](https://testcafe.devexpress.com) been deprecated?

[TestCafe v2015.1](https://testcafe.devexpress.com) is no longer available for purchase or subscription renewal. We recommend that TestCafe v2015.1 users switch to [TestCafe Studio](https://www.devexpress.com/products/testcafestudio/) to access the latest features. See this [blog post](https://community.devexpress.com/blogs/testcafe/archive/2018/11/26/testcafe-studio-a-new-web-testing-ide.aspx) for details.

### Which browsers does TestCafe support? What are the exact supported versions?

You can find a list of supported browsers in
[our documentation](../documentation/guides/concepts/browsers.md).
TestCafe is tested against the two latest versions of each browser
except for the browsers whose versions are specified explicitly in this list.

We do not use the most recent JavaScript features in TestCafe code,
which means it should work with any browser with HTML5 support released in the last three years.

### Can I use third-party modules in tests?

You can import third-party modules to the test code and inject scripts into tested webpages.

To [import a module to a test file](../documentation/recipes/import-third-party-modules.md), use the `import` statement.

```js
import fs from 'fs';

fixture `fixture`
   .page('http://localhost/testcafe/');

test('test', async t => {
   const filePath = 'filepath.js';

   await t.expect(fs.existsSync(filePath)).ok();
});
```

If a Node.js module or a JavaScript file can be executed in the browser, you can [inject it into the tested page](../documentation/guides/advanced-guides/inject-client-scripts.md).

```js
fixture `My fixture`
    .page `https://example.com`
    // The fixture.clientScripts method injects jquery.js
    // into all pages visited in this fixture.
    .clientScripts('scripts/jquery.js');

test('test', async t => {
    const clientFunction = ClientFunction(() => {
        // You can use $ here
        return $('div').text();
    });

    const text = await clientFunction();
});
```

For more information about how to inject scripts, see [Inject Scripts Into Tested Pages](../documentation/guides/advanced-guides/inject-client-scripts.md).

### How do I work with configuration files and environment variables?

TestCafe allows you to specify settings in a [configuration file](../documentation/reference/configuration-file.md).

If you need to use custom properties in the configuration, create a separate configuration file and import it to the tests.

> Vote for the following GitHub issue if you want us to support custom properties in `.testcaferc.json`: [#3593](https://github.com/DevExpress/testcafe/issues/3593)

For example, you can create the following `config.json` file to pass a website's base URL to test code:

```json
{
    "baseUrl": "http://localhost/testcafe"
}
```

In the test code, import it like a regular JavaScript module:

```js
import config from './config';

fixture `Fixture`
    .page `${config.baseUrl}/test1/index.html`;
```

Alternatively, you can use [environment variables](../documentation/recipes/access-environment-variables-in-tests.md).

### How do I identify elements with dynamic IDs?

TestCafe selectors should use element identifiers that persist between test runs. However, many JavaScript frameworks generate dynamic IDs for page elements. To identify elements whose `id` attribute changes, use selectors based on the element's class, content, tag name, or position.

See the [Select Elements With Dynamic IDs](../documentation/guides/basic-guides/select-page-elements.md#select-elements-with-dynamic-ids) example for details.

## Troubleshooting

### I have installed TestCafe but I cannot run it. What should I do?

**Check your firewall.** First, make sure that your firewall does not block the ports TestCafe uses.
TestCafe chooses free ports automatically by default. Use the
[--ports](../documentation/reference/command-line-interface.md#--ports-port1port2) command line option
or the [createTestCafe](../documentation/reference/testcafe-api/global/createtestcafe.md)
API factory function to specify custom ports. After that, check that the firewall does not block these specific ports.

**Check your proxy server.** Another reason for this problem can be the proxy server you use to access the Internet.
If your network is connected to the Web via a proxy, use the
[--proxy](../documentation/reference/command-line-interface.md#--proxy-host) command line option
or the [useProxy](../documentation/reference/testcafe-api/runner/useproxy.md) API method
to specify the proxy address.

**For Linux check X11.** Also note that if you run TestCafe on Linux,
you need to make sure the system is running the [X11](https://en.wikipedia.org/wiki/X_Window_System) server.
Without X11, you can only run tests in cloud services and headless Google Chrome.
However, if you use the [Xvbf](https://en.wikipedia.org/wiki/Xvfb) server, you can run any other browser in the headless mode.

### When I run a TestCafe test, I get an unexpected error. What can cause that?

**JavaScript errors.** The most common reason for this is a JavaScript error on the tested page.
Load this page in the browser, open the console and see if the page has any errors.
In case there are errors, you can either fix them or use
the [--skip-js-errors](../documentation/reference/command-line-interface.md#-e---skip-js-errors) flag
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

This happens because either:

* one of the [selectors](../documentation/guides/basic-guides/select-page-elements.md) you used in test code does not match any DOM element, or
* you used an incorrect CSS selector or a client-side function that returns no element to specify an [action's target element](../documentation/reference/test-api/testcontroller/click.md#select-target-elements).

To determine the cause of this issue, do the following:

1. Look at the error message in the test run report [to learn which selector has failed](../documentation/guides/basic-guides/select-page-elements.md#debug-selectors).
2. Add the [t.debug()](../documentation/guides/basic-guides/debug.md) method before this selector to stop test execution before it reaches this point.
3. Run the test and wait until the browser stops at the breakpoint.

After this, use the browser's development tools to check that:

* the element is present on the page;
* the element is visible (TestCafe considers it visible if it does not have `display` set to `none`,
  `visibility` set to `hidden` or the zero `width` or `height`);
* the element's part targeted by the action is visible (the center of the element, or a point specified by the [`offsetX` and `offsetY`](../documentation/reference/test-api/testcontroller/click.md#options) parameters);
* the element is not in an `<iframe>` (if it is, use the
  [t.switchToIframe](../documentation/guides/basic-guides/interact-with-the-page.md#work-with-iframes) method
  to switch to the appropriate `<iframe>`).

Also, try running the test in full screen.
Use the [t.maximizeWindow](../documentation/reference/test-api/testcontroller/maximizewindow.md)
and [t.resizeWindow](../documentation/reference/test-api/testcontroller/resizewindow.md) actions
to control the browser window size. If the test passes, it means your webpage hides
the target element when the window is resized to smaller dimensions.

Finally, try updating TestCafe to the latest version to see if the problem persists.

### TestCafe reports that a request has failed. What are the possible reasons?

When TestCafe does not receive a successful response from a server, it outputs the following error:

```text
A request to https://www.example.com has failed.
Use quarantine mode to perform additional attempts to execute this test.
```

You can use [quarantine mode](../documentation/guides/basic-guides/run-tests.md#quarantine-mode) to complete the tests if this problem occurs infrequently.

However, we recommend that you determine the cause of this issue and address it.

This error can occur in the following situations:

#### The Web server is not responding

Check if the Web and DNS servers are online and configured to accept requests to this URL.

#### Unstable or improperly configured network connection

* Check the network connection's settings.
* Ensure that your network equipment works properly. If possible, establish a direct connection to the Internet/Web server.
* Check the proxy server's settings or try a different proxy server.
* Use VPN.
* Connect to a different network.

#### Not enough resources in the container or CI system

If you run TestCafe in a container or CI system, use the following steps to diagnose resource shortage:

* Increase the container's resource limits.
* Set the [concurrency factor](../documentation/guides/basic-guides/run-tests.md#run-tests-concurrently) to `1`.
* Deploy the application's Web server on a separate machine.
* Run tests on a local device outside a container.

If this fixes the tests, it indicates that they require additional resources. You can address this in the following ways:

* Adjust the container's or environment's settings to allocate more resources.
* If you use a cloud-based CI system, ask the service provider for an upgrade or consider a different CI service with better hardware or smaller loads.

According to users' feedback, the following CI systems work best with TestCafe:

* [Azure Pipelines](../documentation/guides/continuous-integration/azure-devops.md)
* [GitLab](../documentation/guides/continuous-integration/gitlab.md)
* [TravisCI](../documentation/guides/continuous-integration/travis.md)
* [CircleCI](../documentation/guides/continuous-integration/circleci.md)
* [AppVeyor](../documentation/guides/continuous-integration/appveyor.md)
