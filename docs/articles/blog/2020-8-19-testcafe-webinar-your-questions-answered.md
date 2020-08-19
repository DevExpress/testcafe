---
layout: post
title: "TestCafe Webinar - Your Questions Answered"
permalink: /media/team-blog/:title.html
isTeamBlog: true
author: TestCafe Team
---
# TestCafe Webinar - Your Questions Answered

We recently hosted a webinar on TestCafe and found the response overwhelming. During the presentation a large number of questions were raised, and as promised, the team have been through and answered them all.

<!--more-->

## Watch the Webinar

<!-- markdownlint-disable MD033 -->

<iframe width="560" height="315" src="https://www.youtube.com/embed/kwV_HCE7neM" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

<!-- markdownlint-enable MD033 -->

## Webinar Resources

**Does the book (*End-to-End Testing with TestCafe* by Dennis Martinez) go over the examples from the Webinar?**  
This webinar is based on the book, so you will certainly find details about the examples we showed.

**Is the webinar available in other languages?**  
We currently hold online events in English only.

**In what language the application you show is written?**  
It is JavaScript, the ES6 standard.

## TestCafe Benefits

**What are the advantages of TestCafe over Selenium/Cypress/Nightwatch.js/Robot Framework/WebdriverIO?**

* TestCafe does not require browser plugins, SDKs or other tools and libraries - just Node.js and browsers.
* You don't need to configure testing environment. Install TestCafe from npm and you are ready to test.
* TestCafe is truly cross-browser and cross-platform. It can run tests on Windows, macOS, Linux, iOS, and Android.  Supported browsers include Chrome, Firefox, Safari, Edge, and Internet Explorer.
* TestCafe features a built-in wait mechanism. You don't need to insert manual waiting in your tests. TestCafe waits for all kinds of loadings and animations automatically, so your tests are stable even when they slow down for whatever reason.
* TestCafe allows you to test even the most complex scenarios like those with cross-domain navigation, file upload, sophisticated iframe use cases, secure services (payment, geolocation) or multiple windows (in beta).

## License

**Do I need to purchase a separate license for TestCafe? Is it included in any of the DevExpress subscriptions?**  
TestCafe is open-source and free. It is licensed under [the MIT license](https://github.com/DevExpress/testcafe/blob/master/LICENSE).

## Desktop Application Testing

**Does TestCafe only work in a browser? Can I use it to test desktop applications, like WinForms?**  
TestCafe is designed for Web applications only. Thankfully, if you use Electron.js for your desktop application, you can easily [test it with TestCafe](https://github.com/DevExpress/testcafe-browser-provider-electron).

## Parallelization

**Can I start 100 TestCafe tests to simulate high load?**  
You can start 100 parallel browser instances if your computer has sufficient resources to run such a number of browsers. But we recommend using TestCafe for end-to-end rather than load testing.

**Can I run the tests in parallel in multiple browser windows?**  
Yes, TestCafe allows you to execute tests concurrently. In concurrent mode, TestCafe invokes multiple instances of each browser. These instances constitute the pool of browsers against which tests run concurrently, i.e. each test runs in the first available instance. You can find information how to run tests in parallel [in this topic](https://devexpress.github.io/testcafe/documentation/guides/basic-guides/run-tests.html#run-tests-concurrently).

**How well does TestCafe scale when it comes to parallelization? What is the ideal number of tests that can be run in parallel?**  
You can run any number of tests in concurrent mode. Regarding the number of browser instances that can be used to run these test, it's hard to name an optimal number. It all depends on the resources available on your machine and the tests themselves. It is best to choose this number on a case-by-case basis.

**Can I have multiple TestCafe instances running tests?**  
Yes, you can use several TestCafe instances. There are no special restrictions here. But in this case you will have to make sure that the instances do not conflict for resources (open ports, access to files, etc.).

**Is there a way to start more parallel tests in memory without running browsers?**  
Concurrent mode implies launching the specified number of browser instances. All instances will be launched even if the number of tests is not enough to run at least one on each of them. Therefore, now there is no way to use this mode without launching browsers.

## Integrations

**Does TestCafe integrate with BrowserStack?**  
Yes, you can run tests in Cloud Testing Services (BrowserStack, Sauce Labs) via the corresponding plugins. See more [in the documentation](https://devexpress.github.io/testcafe/documentation/guides/concepts/browsers.html#browsers-in-cloud-testing-services).

**Can I run TestCafe on Azure DevOps?**  
You can find a topic about Azure DevOps integration in [the TestCafe documentation](https://devexpress.github.io/testcafe/documentation/guides/continuous-integration/azure-devops.html).

**Can I run TestCafe on Jenkins where there are no local browsers installed? Should I use headless mode on Jenkins?**  
If the machine that runs Jenkins does not have local browsers installed, you can use [portable](https://devexpress.github.io/testcafe/documentation/guides/basic-guides/run-tests.html#test-in-portable-browsers) browsers or [cloud testing services](https://devexpress.github.io/testcafe/documentation/guides/basic-guides/run-tests.html#test-in-cloud-testing-services) (BrowserStack, SauceLabs).

[Headless mode](https://devexpress.github.io/testcafe/documentation/guides/basic-guides/run-tests.html#use-headless-mode) is supported for both locally installed and portable browsers. We recommend that you use headless mode to decrease testing time. You can run browsers in headless mode even on machines without graphical system.

[This tutorial](https://devexpress.github.io/testcafe/documentation/guides/continuous-integration/jenkins.html) describes how to integrate TestCafe with Jenkins.

You may also wish to check [the TestCafe plugin for Jenkins](https://devexpress.github.io/testcafe/media/team-blog/introducing-the-testcafe-jenkins-plugin.html) that attaches screenshots and videos to the Jenkins test results page.

**Is TestCafe compatible with Angular applications?**  
Yes, TestCafe has full support for Angular applications. You can use [the Angular selector plugin](https://github.com/DevExpress/testcafe-angular-selectors) that adds selector extensions to make it easier to test Angular applications with TestCafe. These extensions allow you to create a Selector to find elements on the page in a way that is native to Angular applications.

**Does TestCafe support Vue?**  
Yes, TestCafe allows you test Vue applications the same way as any other apps. You can use [the Vue selector plugin](https://github.com/DevExpress/testcafe-vue-selectors) that contains selector extensions to make it easier to test Vue components with TestCafe. These extensions allow you to test Vue component state and result markup alongside.

**Can TestCafe pick elements by their React component name?**  
You can use [the TestCafe selector plugin for React components](https://github.com/DevExpress/testcafe-react-selectors). This plugin adds selector extensions that allow you to select page elements in a way that is native to React. For instance, you can use component names to identify page elements.

**Is TestCafe compatible with Knockout?**  
Yes, TestCafe can test applications based on Knockout. There are no known issues.

**Does TestCafe support Bamboo?**  
You can use "Script Task" in Bamboo setting to write a wrapper that invokes automated tests. Alternatively, you can use [the TestCafe Docker image](https://devexpress.github.io/testcafe/documentation/guides/advanced-guides/use-testcafe-docker-image.html).

## Blazor

**Can I use TestCafe to test a Blazor application?**  
TestCafe supports testing for Blazor apps. You can test your Blazor app the same way as any other application. There are no known issues.

## Action Chaining

**Are there limitations as to what kinds of actions can be chained? Is it the best practice to chain as many actions as I can?**  
Almost all TestCafe [test controller's methods](https://devexpress.github.io/testcafe/documentation/reference/test-api/testcontroller/) can be chained, except those that return a value and hence break the chain:

* [t.eval](https://devexpress.github.io/testcafe/documentation/reference/test-api/testcontroller/eval.html)
* [t.getBrowserConsoleMessages](https://devexpress.github.io/testcafe/documentation/reference/test-api/testcontroller/getbrowserconsolemessages.html)
* [t.getNativeDialogHistory](https://devexpress.github.io/testcafe/documentation/reference/test-api/testcontroller/getnativedialoghistory.html)

You can chain these methods in any desirable manner but we recommend adding blank lines between logical parts of the action chain to improve tests readability, e.g.

```js
await t
    .click('#id1') //some settings
    .click('#id1')
    .click('#id1')

    .expect(Selector('#result').textContent).eql('expected text');//assertion
```

**Can I extend the TestController object with my own chainable methods? Or only helpers and pageobjects are the way to go?**  
TestController cannot be extended with custom methods at the moment. We may consider adding this feature, but it isn't in our current roadmap. As you correctly suggested, you can use helpers and page objects to implement custom methods.

## TestCafe Studio

**Can TestCafe record my actions (some tests need many entries and writing them is very time-consuming)?**  
You can use [TestCafe Studio](https://www.devexpress.com/products/testcafestudio/) that has a built-in test recorder. It allows you to record your actions without coding them.

**Is there a user interface for building tests, or is it all JS-based?**  
You can use TestCafe Studio which is a UI tool to maintain your tests.

**Is TestCafe Studio a desktop application or is it available as a Web service?**  
TestCafe Studio is a cross-platform desktop application (powered by Electron.js). You can download its installer for Windows, macOS or Linux and install on your machine. Offline registration is available for computers without internet access. Read more in the [Installation topic](https://docs.devexpress.com/TestCafeStudio/400163/guides/installation) in the Docs.

**Does TestCafe Studio require a license?**  
Yes, this is a [commercial product](https://devexpress.com/testcafestudio) that requires obtaining a license. There are two options available: TestCafe Studio and TestCafe Studio Pro with DevExpress Technical support.

**Can TestCafe Studio generate tests steps in a more user-friendly form than code?**  
TestCafe Studio has the built-in [Test Editor](https://docs.devexpress.com/TestCafeStudio/400190/user-interface/test-editor) designed for codeless test creation.

**Can you change the order of tests on the side panel on the left?**  
The [Explorer Panel](https://docs.devexpress.com/TestCafeStudio/400182/user-interface/explorer-panel) allows you to view and manage files in your testing directory. For recorded tests, the Explorer Panel displays fixtures and tests. You can create new tests, copy/paste them and more. But currently you can't change the order of the tests.

**Are there more formats of report logs in TestCafe Studio?**  
In the Report View you can see tests run report in the TestCafe Studio format - [Grid View](https://docs.devexpress.com/TestCafeStudio/400187/user-interface/report-view)

The following built-in reports formats are also available:

* JSON
* xUnit
* List
* Minimal
* Spec

You can install TestCafe reporter plugins to add more formats: [Get More Report Formats](https://docs.devexpress.com/TestCafeStudio/400187/user-interface/report-view#get-more-report-formats).

**Is there any guide with comprehensive instructions and examples for TestCafe Studio?**  
See the guides, videos, and examples [in the TestCafe Studio documentation](https://docs.devexpress.com/TestCafeStudio/400157/testcafe-studio).

**What is the element locator strategy?**  
TestCafe Studio use some characteristic of the DOM element in order to identify it on the page, such as id, class, text etc. You can set the usage priority of these characteristics, switch them off (e.g. for auto generated id) or create new ones based on custom attributes. See the details in [the documentation](https://docs.devexpress.com/TestCafeStudio/400407/test-actions/element-selectors).

**Is TestCafe Studio a part of the Universal Subscription?**  
Yes, [TestCafe Studio Pro version is](https://www.devexpress.com/subscriptions/universal.xml).

**Does TestCafe Studio support console.log output? I am currently running tests from the command line so I'd like to see my console.log statements.**  
You can add [the Run TestCafe Script action](https://docs.devexpress.com/TestCafeStudio/401265/test-actions/custom-scripts). In this action, you can use `console.log()` to print messages directly, or even call [t.getBrowserConsoleMessages()](https://devexpress.github.io/testcafe/documentation/reference/test-api/testcontroller/getbrowserconsolemessages.html) to fetch messages from the browser's console.

**Can TestCafe Studio generate reports with statistics, graphs, pies, etc., illustrating execution results?**  
Currently there is no such capability.

**In TestCafe Studio, moving a line becomes almost impossible over 100 lines. Is that a memory issue that can be changed via config?**  
We cannot reproduce this behavior on our side. Please create an inquiry on [https://www.devexpress.com/ask](https://www.devexpress.com/ask) and provide more detail about the issue you encounter.

**We are using both DevExpress and custom controls in our application. We record tests in TestCafe Studio, but they fail when we run them. Can you tell why this happens?**  
To resolve the issue, please refer to the Troubleshooting section on our [FAQ page](https://docs.devexpress.com/TestCafeStudio/400610/faq). If suggestions described there do not help or apply to your case, create a ticket on [https://www.devexpress.com/ask](https://www.devexpress.com/ask) and describe your issue in detail.

## Page Model

**Do you create the page models manually? Can the page models be dynamically generated?**  
Page Models should be created manually, there is no built-in way to generate page models automatically. A page model reflects the internal structure of the testing page: what is the container, what is the parent and what is the child, etc., which distinguishing characteristics are best used to identify elements. Any automatically generated model is unlikely to reflect these semantics.

**Is it necessary to create selectors with the Selector constructor in a page object class?**  
No, you can use CSS strings:

```js
class Page {
    constructor(){
        this.submitButton = '#submit';
    }
}
```

But if you want to extend or chain such a selector with [selector's methods](https://devexpress.github.io/testcafe/documentation/reference/test-api/selector/), you will need to use the Selector constructor:

```js
class Page {
    constructor () {
        this.button       = Selector('button');
        this.submitButton = this.button.withText('Submit');
        this.cancelButton = this.button.withText('Cancel');
    }
}
```

**Can I add additional methods to page object in TestCafe?**  
Yes, you can add methods to a page model. Usually these methods are the most frequently repeated actions specific to this page. See an example in [the TestCafe docs](https://devexpress.github.io/testcafe/documentation/guides/concepts/page-model.html#step-7---add-actions-to-the-page-model).

**Does TestCafe support the PageObjects library?**  
If you mean [this PageObjects library](https://github.com/devcon5io/pageobjects), then TestCafe does not support it because this library is designed for Selenium.

## Database Access

**Can test results be sent to a database?**  
There's no built-in functionality for this, but you can certainly [make a plugin](https://devexpress.github.io/testcafe/documentation/guides/extend-testcafe/reporter-plugin.html) that will do this.

**Can TestCafe connect to databases to verify that the correct data was written?**  
TestCafe doesn't have built-in functionality for interaction with databases. But you can use any npm module for it.

## Browsers

**Does TestCafe support Microsoft Edge? Can TestCafe create mocks and run tests in IE11?**  
Yes, TestCafe supports both browsers. You can find the list of supported browsers in [the TestCafe docs](https://devexpress.github.io/testcafe/documentation/guides/concepts/browsers.html#officially-supported-browsers).

## Selectors

**What type of selectors are available? Is it only HTML element IDs and/or classes?**  
You can use any [pure CSS selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors) or [TestCafe Selector API](https://devexpress.github.io/testcafe/documentation/reference/test-api/selector/) that extends capabilities offered by CSS selectors.

**Can I target elements based on text that is actually visible to the end-user?**  
TestCafe Selector's [withText](https://devexpress.github.io/testcafe/documentation/reference/test-api/selector/withtext.html) method finds elements by text that is visible to the end-user (the element's `innerText` property). You can also create a selector that uses custom logic to find an element. Pass a function to the [selector's constructor](https://devexpress.github.io/testcafe/documentation/reference/test-api/selector/constructor.html#initialize-selectors).

**Is it possible to set the waiting time for an element? What if I mistyped the selector's "name" or the page is loading really slow? How long does TestCafe wait by default?**  
You can specify the Selector's [timeout option](https://devexpress.github.io/testcafe/documentation/reference/test-api/selector/constructor.html#optionstimeout). During this timeout, the selector waits for the element. The default timeout duration is `10000` ms.

**I use auto-generated names for DevExpress control's elements in my application. Can TestCafe interact with them?**  
Yes, you can identify these elements by their static parts. See an example in [our docs](https://devexpress.github.io/testcafe/documentation/guides/basic-guides/select-page-elements.html#select-elements-with-dynamic-ids).

**Can I use XPath to locate elements?**  
XPath selectors are not built-in with TestCafe, but you can implement a simple helper method to use them. [See an example here](https://github.com/DevExpress/testcafe-examples/tree/master/examples/use-xpath-selectors).

**Can I verify a certain element does not exist or will that cause a failure?**  
If an element used in some action doesn't exist, a test fails. A test run report then indicates that the test failed because a target element doesn't exist on the page. To check if the element exists before TestCafe attempts to interact with it, use the following approach

```js
if(await Selector('#element').exists)
    await t.click(Selector('#element'));
```

For instance, you would use this verification to close ad popups (should they appear).

## Debug

**Are there any approaches that help debug tests? How can I debug TestCafe and the Hammerhead proxy?**  
Check out [this blog post](https://devexpress.github.io/testcafe/media/team-blog/how-to-debug-tests-in-testcafe-quick-guide.html) on how to debug your application and tests.

You can also find the instruction about how to debug in other IDEs in [our guide](https://devexpress.github.io/testcafe/documentation/guides/basic-guides/debug.html).

To debug TestCafe and Hammerhead, enable the development mode. Use the [--dev flag](https://devexpress.github.io/testcafe/documentation/reference/command-line-interface.html#--dev) when you run tests:

```sh
testcafe chrome my-tests --dev
```

**What are the available debug options?**  
The following capabilities help you determine the cause of errors and failures:

* [Take screenshots automatically when tests fail](https://devexpress.github.io/testcafe/documentation/reference/command-line-interface.html#takeonfails),
* [Capture videos of test runs](https://devexpress.github.io/testcafe/documentation/reference/command-line-interface.html#--video-basepath),
* [Set the speed of test execution](https://devexpress.github.io/testcafe/documentation/reference/command-line-interface.html#--speed-factor)
* [Enter debug mode](https://devexpress.github.io/testcafe/documentation/reference/command-line-interface.html#--debug-on-fail) automatically when the first test fails,
* Execute tests step by step in [debug mode](https://devexpress.github.io/testcafe/documentation/reference/command-line-interface.html#-d---debug-mode).

**Can TestCafe capture a screenshot when a test fails?**  
Absolutely, enable the [takeOnFails](https://devexpress.github.io/testcafe/documentation/reference/command-line-interface.html#takeonfails) option to do this.

## Authentication

**Can I log in once and execute multiple tests under the same account rather than logging in in every test?**  
Yes, you can use roles to perform actions that log you in only once. In the subsequent tests, you just activate the role you defined earlier to log in without repeating the authentication process each time. See [User Roles](https://devexpress.github.io/testcafe/documentation/guides/advanced-guides/authentication.html#user-roles) in the documentation for details.

**Do roles work with auth0/openid which has JWT in headers?**  
Roles can process the JWT if it is sent in the cookies or stored in the local or session storage.

**Would we run into any issues if we're using Microsoft authentication tokens for permissions?**  
You should not have any issue. Please try this and see how it works. If you face any issues, let us know, so we can research it.

**How does TestCafe log out the user to switch to a different role? Does it just re-open the page?**  
When you switch to a role that was active previously in the current session, TestCafe restores cookies and browser's local and session storage where authentication data is located. If the new role wasn't used yet, TestCafe just resets the cookies and storage and then performs authentication actions.

**Can you create Roles with API calls instead of functional steps?**
If your question is about REST API, then yes, you can call REST API to authenticate a user in a role. Just note that you need to use a [client function](https://devexpress.github.io/testcafe/documentation/guides/basic-guides/obtain-client-side-info.html) to call REST API from the browser. You may want to [inject a library that can call API into the tested page](https://devexpress.github.io/testcafe/documentation/guides/advanced-guides/inject-client-scripts.html).

**What are the options for smart card logins?**
TestCafe only supports web-based authentication. That is, your website should be able to authenticate you by your actions in the web browser, without relying on additional hardware. The only way is to deploy a testing instance of your web app without smart card authentication.

## Multiple Apps, Windows, and Tabs

**Can TestCafe test integration across multiple applications?**  
Yes, you can test any number of web applications.

**Can you test multiple browser windows at the same time? For example, I may need to access application A, then check application B and come back to A.**  
Yes, you can do this. We released multiple window support in beta in v1.9.0. Please find more information in the [Multiple Browser Windows](https://devexpress.github.io/testcafe/documentation/guides/advanced-guides/multiple-browser-windows.html) topic and don't hesitate to leave your feedback. Your opinion helps us make sure you get the best experience when this feature is released.

**Does TestCafe support multiple tabs?**  
You can open and switch between multiple browser windows with [this new beta feature](https://devexpress.github.io/testcafe/documentation/guides/advanced-guides/multiple-browser-windows.html). TestCafe will open a new popup window instead of a tab when necessary. This is because tabs can be throttled which interrupts TestCafe scripts.

## iframes

**Does TestCafe support iframes?**  
Yes, TestCafe supports iframes and provides two simple methods to interact with their content: [switchToIframe](https://devexpress.github.io/testcafe/documentation/reference/test-api/testcontroller/switchtoiframe.html) to switch the test's browsing context to iframe's context and [switchToMainWindow](https://devexpress.github.io/testcafe/documentation/reference/test-api/testcontroller/switchtomainwindow.html) to switch it back to the main window.

## Reports

**How does TestCafe output test run reports? Where can I find test results?**  
TestCafe shows the test run report in the console by default. You can redirect output to a file or use dedicated reporters to post reports to a CI system or elsewhere.

**What happens when a test fails? What logs are produced?**  
If a test fails, you will see a comprehensive report in the console. For instance:

![Report example](/testcafe/images/blog/2020-8-19-report-example.png)

Multiple report formats are supported, including the following:

* spec
* list
* minimal
* xUnit
* JSON

Read more in [the TestCafe documentation](https://devexpress.github.io/testcafe/documentation/guides/concepts/reporters.html).

**In what format does TestCafe generate the reports? Is it XML or HTML?**  
The format depends on the reporter. It can be XML, JSON, HTML, and many others. You can [explore the available reporter packages on npm](https://www.npmjs.com/search?q=testcafe-reporter).

## Test Organization

**Can I use logic operators to have different conditional "paths" during a test?**  
Yes, TestCafe can do conditional testing. You can use standard JavaScript if-clauses to make this happen.

**Is it possible to share fixtures between test files?**  
TestCafe treats fixtures declared in different files separately. If you can share your use case when merging fixtures is useful, please [open an issue](https://github.com/DevExpress/testcafe/issues/new?template=feature_request.md) on GitHub.

## How TestCafe Works

**Did I miss what the `async` keyword means in code? Is that to say TestCafe commands can run as other tests are running?**  
`async` is a JavaScript keyword that indicates that the function is asynchronous. Technically, an asynchronous function means that this function returns a Promise. TestCafe actions are asynchronous because so are the page events. Page loading, animations, HTTP requests take different amounts of time. The test function is asynchronous as well because it uses asynchronous TestCafe actions.

`await` means that the next command should not execute until the previous ("awaited") command is completed. This is required to execute test actions in the right sequence (and, in the same manner, TestCafe "awaits" tests in a fixture to run them one by one). Note that, by contrast, tests in different browsers can run in parallel, just like in concurrency mode.

**Please provide technical insight about how TestCafe avoids installing special plug-ins in order to interact with the browser. How does it actually interact with browsers?**  
TestCafe proxies the tested webpage and injects automation scripts right inside the proxied copy. This way, browsers do all the work when they execute the injected scripts. You can find more details in the [How It Works](https://devexpress.github.io/testcafe/documentation/how-it-works/) article.

**Is it possible to access runtimeJS objects from application client libraries loaded in the browser?**
TestCafe is designed to conceal itself from application's JavaScript code. This is necessary to ensure that pages proxied by TestCafe run exactly in the same way as they do on the website. For this reason, application code cannot access TestCafe scripts or test code entities.

## Waiting and Asynchrony

**What if a portion of a page takes a while to render (for instance, the page uses AJAX). Can TestCafe take it into account?**  
Yes, TestCafe tests wait automatically until the page is rendered completely. You can also insert manual waiting, but it shouldn't be necessary in almost all cases.

**I set up my page in a jQuery callback: `$(document).ready(function(){})`. Will there be JS races with TestCafe?**  
TestCafe will wait until the page loads completely and run tests only after that. TestCafe wait mechanisms are designed to prevent races with JS code.

**It is great that TestCafe handles waiting internally. Would there be a need to override default timeout functionality though? How should a user go about it?**  
You may need to override the default timeout if your page requires extra long waiting. All TestCafe auto-wait timeouts are customizable. You can find more information in the [Built-in Wait Mechanisms](https://devexpress.github.io/testcafe/documentation/guides/concepts/built-in-wait-mechanisms.html) topic.

## Other Features

**Does TestCafe support all ES6 or later features? Do I need plugins to support arrow functions or the async/await syntax?**  
TestCafe supports all modern JavaScript and TypeScript features. No plugins needed, everything works out of the box.

**Can TestCafe work with the Service Worker?**  
We are currently in the progress of implementing full support for Service Workers. Stay tuned for our updates to be the first to know when we are ready.

**Does TestCafe work with Python?**  
You can write tests in JavaScript/TypeScript/CoffeeScript only.

**Does TestCafe support upload ( excel ) data functionality?**  
TestCafe can upload files, including Excel, to websites if it is a part of the test scenario. However, if you are asking about API to access Excel data sheets from test code, TestCafe does not provide one out of the box. You can search for npm modules that implement the functionality you need and use them from TestCafe tests.

**What about functional test coverage? Does TestCafe support it?**  
Test coverage estimation is not available at the moment.

## Miscellaneous

**If TestCafe runs in headless mode, is it still possible to grab screenshots on failures?**  
Yes, TestCafe can take screenshots even in headless mode.

**Does this require a test framework like jest/mocha/jasmine?**  
No additional frameworks are required for TestCafe.

**How can I use TestCafe to test different resolutions?**  
You can use the [t.resizeWindow](https://devexpress.github.io/testcafe/documentation/reference/test-api/testcontroller/resizewindow.html) action to change the browser window size and test adaptive UIs. TestCafe also supports [Chromium device emulation](https://devexpress.github.io/testcafe/documentation/guides/basic-guides/run-tests.html#enable-mobile-device-emulation) to test on emulated mobile devices of various sizes.

**Can we use Test Cafe to compare two documents? Like documents with logos, disclaimers and other information?**  
If you mean visual comparison, TestCafe does not provide this functionality out of the box. However, you can find multiple open-source packages that try to solve this task, like [testcafe-blink-diff](https://github.com/tacoss/testcafe-blink-diff). Note that they are maintained by the community and are not related to the TestCafe team.

If your goal is to compare HTML, you can pass `innerHTML` to a TestCafe assertion as shown in the example in [this topic](https://devexpress.github.io/testcafe/documentation/reference/test-api/selector/addcustomdomproperties.html).

**How do you change the base URL to test in different environments?**  
You can import the base URL from a configuration file or an environment variable, and then use it to build start page URLs in test code. See [this example](https://devexpress.github.io/testcafe/faq/#how-do-i-work-with-configuration-files-and-environment-variables) on the FAQ page.

**Can I run TestCafe on a Linux computer without the UI?**  
Yes, you can run your tests on Linux and use headless browsers to run your tests without the UI.

**Could you please share ideas about how to do localization testing? Does TestCafe support that?**  
TestCafe does not have built-in functionality for localization testing. As a suggestion, you can fetch the localization strings from a resource file or database with Node.js means or third-party npm modules. Then, you can create [data-driven tests](https://devexpress.github.io/testcafe/documentation/recipes/best-practices/create-data-driven-tests.html) that check if the displayed strings are localized (present in the localization resources).

**When do you plan to release version 1.9.0?**  
1.9.0 was released on August 6th. If you are asking about the multi-window support final release, we do not have an exact date yet.

**How does TestCafe handle exceptions?**  
TestCafe considers the test failed if its code throws an exception. The report will indicate the line of code and call stack where this exception originated. Exceptions in JavaScript code on the tested page also make tests fail. However, this behavior is customizable. You can use the [--skip-js-errors](https://devexpress.github.io/testcafe/documentation/reference/command-line-interface.html#-e---skip-js-errors) flag to ignore page errors. Similarly, the [--skip-uncaught-errors](https://devexpress.github.io/testcafe/documentation/reference/command-line-interface.html#-u---skip-uncaught-errors) flag allows you to continue tests when test code throws an exception.

**Can we measure client-side performance using TestCafe (both HTTP and script execution time)?**  
TestCafe is not intended for this task. In fact, TestCafe impacts webpage performance when it runs tests. We are constantly optimizing our code to minimize this slowdown, but we do not aim to precisely match the original performance.

**Are tests executed in sequence within a fixture?**  
Yes, tests are executed as they are declared in code.

**Can I add my custom element library to the context object?**  
You can add anything to the feature and test context objects. However, keep in mind that test code does not run in the browser, so adding browser libraries to the context objects might not help. If this is the case, you may be more interested in the [custom script injection functionality](https://devexpress.github.io/testcafe/documentation/guides/advanced-guides/inject-client-scripts.html) designed for user's client libraries.

**Can TestCafe test HTML5 features like fullscreen, camera, audio, or video interaction?**  
Yes, you can test these HTML 5 features with TestCafe.

Note that you might need to set the `--autoplay-policy=no-user-gesture-required` browser flag as explained in [this article](https://devexpress.github.io/testcafe/documentation/reference/command-line-interface.html#start-a-browser-with-arguments) to test the fullscreen mode and audio/video. The camera can be mocked using [ClientFunctions](https://devexpress.github.io/testcafe/documentation/guides/basic-guides/obtain-client-side-info.html).

**Does TestCafe support multiple domains in a test?**  
Yes, navigation and requests between different domains work out of the box. You do not need to care if you visit pages on one or several domains.

**What happens if TestCafe loses network connection with a remote device that runs tests?**  
Tests cannot run without a network connection because TestCafe must be able to send commands to the remote device. If the connection is interrupted, TestCafe will throw an error saying that a browser connection is lost.

**Is it possible to run all JS in one command? Could you please specify this command?**  
If I understand you correctly, yes, you can run all your JS tests using a single console command.
Here is the CLI reference where you can see the [testcafe command syntax](https://devexpress.github.io/testcafe/documentation/reference/command-line-interface.html).

**I noticed non-standard code indentation. Is a respective formatter for VS Code available?**  
We didn't release a specific formatter because you can use any indentation you prefer with TestCafe.

**Can I use TestCafe to test the development and production instances of my app? If so, how can I configure different URLs for my instances?**  
Yes, you can import the base URL from a configuration file or an environment variable, and then use it to build start page URLs in test code. See [this example](https://devexpress.github.io/testcafe/faq/#how-do-i-work-with-configuration-files-and-environment-variables) on the FAQ page.

**Does TestCafe have support for file download? Can you set the default file download location using TestCafe API?**  
Yes, if test actions on the page trigger file download, the browser will download it as usually. Then you can access the file from test code to perform verification. Currently, TestCafe API does not allow you to set the default download location.
