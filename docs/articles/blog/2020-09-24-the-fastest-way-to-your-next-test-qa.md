---
layout: post
title: "The Fastest Way to Your Next Test – TestCafe + TestCafe Studio - Q&A's"
permalink: /media/team-blog/the-fastest-way-to-your-next-test-qa.html
isTeamBlog: true
author: TestCafe Team
---
# The Fastest Way to Your Next Test – TestCafe + TestCafe Studio - Q&A's

Thank you to all that attended the recent [TestCafe Studio](https://www.devexpress.com/products/testcafestudio/) presentation, the questions raised have been answered by the team and listed below.

<!--more-->

## Watch the Webinar

<!-- markdownlint-disable MD033 -->

<iframe width="560" height="315" src="https://www.youtube.com/embed/3ZsYj1my-us" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

<!-- markdownlint-enable MD033 -->

## Questions & Answers

**Will the webinar recording on YouTube include the Q&A section?**  
We discussed the most popular Q&As at the end of the webinar. This part is included in the [recording](https://youtu.be/3ZsYj1my-us?t=3216). The remaining questions are answered in this post.

**Can I test Windows Form applications with TestCafe Studio?**  
TestCafe Studio can test web applications only.

**Am I allowed to install TestCafe Studio on our customer's site to test it in their environment?**  
TestCafe Studio is a desktop application installed on a developer's/tester's local computer, not on a website. You can install TestCafe Studio on any Windows, macOS, or Linux machine. If the machine where TestCafe Studio runs can access the website deployed on your customer's infrastructure, you can simply specify its URL to test it in its native environment.

**Does TestCafe Studio support multiple languages?**  
The TestCafe Studio UI only supports English. If you are asking about programming languages in which you can write tests, TestCafe Studio supports JavaScript, TypeScript, CoffeeScript, and of course tests recorded in TestCafe Studio (`*.testcafe` files).

**Can I include TestCafe Studio in Continuous Integration?**  
You can use the open-source TestCafe to run tests recorded or written in TestCafe Studio in CI systems. See the [Integrate Tests with CI Systems](https://docs.devexpress.com/TestCafeStudio/400445/guides/integrate-tests-with-ci-systems) topic for more information.

**What value does TestCafe Studio add to an automated CI pipeline in which tests are executed in headless mode?**  
TestCafe Studio allows you to create and modify tests with ease. In a CI system, the tests will run with an open-source TestCafe runner that doesn't make any difference between TestCafe Studio recorded tests and JavaScript TestCafe tests. See the [Integrate Tests with CI Systems](https://docs.devexpress.com/TestCafeStudio/400445/guides/integrate-tests-with-ci-systems) topic for more information. So, TestCafe Studio's goal is to facilitate recording and maintenance.

**Is there a way to record tests in TestCafe Studio and export them to JavaScript to run individually?**  
Yes, you can do this. See the [Convert Recorded Tests to JavaScript](https://docs.devexpress.com/TestCafeStudio/401052/test-directory-structure/test-scripts#convert-recorded-tests-to-javascript) topic for more information.

**Does TestCafe Studio have any known issues with SPA apps, specifically Angular?**  
No, we are not aware of any significant issues with SPAs including Angular applications. You can also make use of the following selector extension that enables you to test Angular applications even easier: [DevExpress/testcafe-angular-selectors](https://github.com/DevExpress/testcafe-angular-selectors)

**Are there any recommendations on the best method for initializing a selector?**  
We plan to publish an article that details the best practices for TestCafe tests, including suggestions on how to build effective selectors. In the meantime, refer to the [Element Selectors](https://docs.devexpress.com/TestCafeStudio/400407/test-actions/element-selectors) topic to learn more about them.

**Does the open-source TestCafe have the reporting and screen capturing capabilities?**  
Yes, it has both. See the [Reporters](https://devexpress.github.io/testcafe/documentation/guides/concepts/reporters.html) and [Screenshots and Videos](https://devexpress.github.io/testcafe/documentation/guides/advanced-guides/screenshots-and-videos.html) topics for details.

**Can I test "concurrent" scenarios where two users use the app and modify the data simultaneously?**  
To simulate users interacting with the app concurrently, you need two browser windows. Support for multiple browser windows is currently available in beta for coded tests only. See the details in the open-source TestCafe documentation: [Multiple Browser Windows](https://devexpress.github.io/testcafe/documentation/guides/advanced-guides/multiple-browser-windows.html). As an alternative solution, you can try running the same test that edits a data record in different browsers at the same time.

**Can I run tests at specific moments in time, e.g. on schedule?**  
You can [integrate your test with any CI service](https://docs.devexpress.com/TestCafeStudio/400445/guides/integrate-tests-with-ci-systems) to run them on schedule.

**Can I receive an email notification with test results once they are done?**  
You can [search for a TestCafe reporter](https://docs.devexpress.com/TestCafeStudio/400187/user-interface/report-view#get-more-report-formats) that sends an email with test run results or [create a new custom reporter](https://devexpress.github.io/testcafe/documentation/guides/extend-testcafe/reporter-plugin.html#generate-a-reporter-project) for your needs.

**Can I deliberately slow down the test run in TestCafe Studio for more convenient viewing?**  
Yes, you can adjust [the Speed option](https://docs.devexpress.com/TestCafeStudio/400179/guides/debug-tests#test-speed) to slow down test execution.

**How do you use the GUI to create a custom attribute for a webpage?**  
You can customize [the selector generation mechanism](https://docs.devexpress.com/TestCafeStudio/400186/user-interface/record-configuration-dialog#selector-generation) to take into account custom attributes. Add a custom attribute name to the list of selector types. TestCafe Studio will then use this attribute to create selectors. On your website end, you should specify the custom attribute for page elements manually.

**Is it possible to write a text assertion with wildcards in it, so that it matches multiple text values?**  
Yes, you can use regular expressions for this purpose: [Match Assertion](https://docs.devexpress.com/TestCafeStudio/400167/test-actions/assertions#match)

**Is it possible to load user credentials from a file to use them in tests?**  
You can use [the Run TestCafe Script action](https://docs.devexpress.com/TestCafeStudio/401265/test-actions/custom-scripts). Write a script that imports [the fs Node.js module](https://nodejs.org/api/fs.html), reads the file content and saves the credentials in [the test context](https://docs.devexpress.com/TestCafeStudio/401265/test-actions/custom-scripts#script-context). Now you can read these values from `t.ctx` in other scripts within Run TestCafe Script actions. Currently, you cannot pass the test context to recorded action parameters.

**Can I create variables to store secrets or URLs for different environments?**  
TestCafe Studio can save [selectors and functions](https://docs.devexpress.com/TestCafeStudio/400401/test-actions/statements) to variables. In [Run TestCafe Script action](https://docs.devexpress.com/TestCafeStudio/401265/test-actions/custom-scripts) code, you can create other types of variables and use them according to your needs. To share variables between different scripts, store them in [the test context](https://docs.devexpress.com/TestCafeStudio/401265/test-actions/custom-scripts#script-context).

**Can I use conditions, add conditional jumps or go-to statements?**  
In recorded tests, you cannot use conditions and go-to statements. You can record test scenarios and then [convert them to JavaScript](https://docs.devexpress.com/TestCafeStudio/401052/test-directory-structure/test-scripts#convert-recorded-tests-to-javascript) to add conditions.

**How to organize tests in TestCafe Studio? How can I tag Smoke and Regression tests to distinguish between them? I tried metadata but found it ineffective. Is there an alternative way in TestCafe Studio?**  
This is no such capability built in so far. You can split your tests across different directories or [convert the recorded tests into JavaScript](https://docs.devexpress.com/TestCafeStudio/401052/test-directory-structure/test-scripts#convert-recorded-tests-to-javascript) and [use metadata](https://devexpress.github.io/testcafe/documentation/guides/basic-guides/organize-tests.html#specify-test-metadata) with the open-source TestCafe test runner.

**Can I use data from external sources (text files or databases) in my tests?**  
Yes, but not in the Test Editor UI. If you [convert the recorded tests into JavaScript](https://docs.devexpress.com/TestCafeStudio/401052/test-directory-structure/test-scripts#convert-recorded-tests-to-javascript), you can use any Node.js or npm module to read data from your files or load from a database to use it in your test cases.

**How can I ensure temporary objects that pop up briefly after a button is pushed or the mouse hovers over something are displayed? The display doesn't last long enough for me to click on it after activating the "=" assertion.**  
In recoded tests, you can add [the Define Function action](https://docs.devexpress.com/TestCafeStudio/400401/test-actions/statements#define-function) that checks if the target element exists every `n` milliseconds and returns the result when the element is found (you can use a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)). Then add an action for click. After that, use the client function's return value in an assertion.

**How would I test visuals that indicate drag-and-drop, since that visuals only exist while you are actively dragging?**  
TestCafe cannot execute an assertion while you are dragging. We may suggest a multi-step workaround where you [inject](https://devexpress.github.io/testcafe/documentation/guides/advanced-guides/inject-client-scripts.html) client-side code that is triggered during the drag, checks for the visuals, and stores the result. When drag is finished, you can obtain this value [via a client function](https://devexpress.github.io/testcafe/documentation/guides/basic-guides/obtain-client-side-info.html) and [verify it in an assertion](https://devexpress.github.io/testcafe/documentation/guides/basic-guides/assert.html). For manual verification, you can use the open-source TestCafe to [record a video of a test run](https://devexpress.github.io/testcafe/documentation/guides/advanced-guides/screenshots-and-videos.html#record-videos) to ensure that the drag-and-drop indicator is displayed.

**How do I run the same test against my app versions deployed in different environments (at different URLs), e.g., FAT/UAT/production?**  
In coded tests, you can [specify the test's start page programmatically](https://devexpress.github.io/testcafe/faq/#how-do-i-work-with-configuration-files-and-environment-variables). To test multiple versions of your app with the same test suite, start the tests as many times as you need while passing a different URL each time.

In recorded tests, you can use the same approach, but instead of setting the start page (which is not possible programmatically), begin tests with [a custom script](https://docs.devexpress.com/TestCafeStudio/401265/test-actions/custom-scripts) that accesses the passed URL and navigates to the required page with the [t.navigateTo](https://devexpress.github.io/testcafe/documentation/reference/test-api/testcontroller/navigateto.html) method.

**Can variables be parameterized?**  
Currently, you cannot use parameters for recorded test steps but you can write any custom code in [the Run TestCafe Script action](https://docs.devexpress.com/TestCafeStudio/401265/test-actions/custom-scripts).

**Can the JS scripts act as a REST client to obtain assertion values (via a service call to a helper endpoint)?**  
Yes, you can use a Node.js HTTP client like [got](https://www.npmjs.com/package/got).

**In our tests, selectors throw errors occasionally. How can we get rid of this irregular behavior?**  
Let us know how we can replicate this behavior. [Please submit an issue in the Support Center](https://devexpress.com/ask).

**Can I record accessibility tests with TestCafe Studio?**  
No, but you can use [axe-testcafe](https://www.npmjs.com/package/axe-testcafe) in coded tests for accessibility testing.

**How do I integrate TestCafe reports with Xray?**  
Check out the following custom reporter plug-in for Xray: [antreyes/testcafe-reporter-xray](https://github.com/antreyes/testcafe-reporter-xray)

**Can you show an example of a much more complex real-life test?**  
We publish TestCafe examples in this GitHub repository: [DevExpress/testcafe-examples](https://github.com/DevExpress/testcafe-examples). You can find both basic examples as well as samples that address some rare scenarios.

However, you wouldn't find a really complex test among our examples because it's not good practice to overengineer end-to-end tests. After all, we created TestCafe to keep your tests simple.

**Can you please show an example with the DevExpress Grid Control?**  
DevExpress Grid Controls can be easily tested with TestCafe like any other web control/page. You can try to record your own test on [JS Grid demo pages](https://js.devexpress.com/Demos/WidgetsGallery/Demo/DataGrid/Overview/jQuery/Light/) with TestCafe Studio.

**Will TestCafe be able to generate tests in other languages, like C#, or using Selenium API, etc?**  
Not in the nearest future.

**Do you offer a testing framework for desktop applications (specifically, .NET)?**  
Yes, we offer [Coded UI](https://www.devexpress.com/products/net/controls/winforms/coded-ui/) for WinForms applications.
