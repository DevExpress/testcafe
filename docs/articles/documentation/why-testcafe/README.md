---
layout: docs
title: Why TestCafe?
permalink: /documentation/why-testcafe/
redirect_from:
  - /documentation/how-it-works/
---

# Why TestCafe?

TestCafe excels where other end-to-end testing solutions fall short.

## No 3rd-Party Dependencies

TestCafe does not depend on Selenium or other testing software. TestCafe runs on the popular Node.js platform, and makes use of the browsers that you already have. For many users, the installation process consists of a single step:

```js
npm install -g testcafe
```

## Human-readable JavaScript tests

The core components of our Node.js API are easy to use, even with little to no prior knowledge of JavaScript.

## A first-class citizen in the Node.js ecosystem

Like all Node.js scripts, TestCafe tests can leverage the capabilities of third-party JavaScript libraries and preprocessors.

## No compromises

The advanced features of TestCafe help you test complex, security-sensitive web applications.

### Mock Requests

Emulate HTTP responses to feed sample data to your app, troubleshoot connectivity errors, and cheat downtime.

### Client-side injections

Execute custom client-side code to parse the web page, examine its state, or even add extra dependencies.

### Frames and windows

Make use of multiple browser windows to test out complex user interactions. Switch to and from iframes with ease and stability.

### Concurrent tests

Run your tests in multiple browsers at once to quickly uncover browser-specific errors.

## Made with automation in mind

### Automated waiting

Manual timeouts are a thing of the past. Asynchronous from the ground up, TestCafe knows when to wait and what to wait for before a test can continue.

### Automated authentication scripts

Save and activate user roles to easily switch between different user accounts.

### Hooks

Keep your code clean with hooks — routines that are repeated before and after each test.

## Superior User Experience

### TestCafe Studio

The GUI and the test recorder built into TestCafe Studio make our product accessible to people with zero programming experience.

### TestCafe Live

Enable the built-in [Live Mode](https://devexpress.github.io/testcafe/documentation/guides/basic-guides/run-tests.html#live-mode) to restart your test every time you make changes to the test file.

### Debugging assistance

Pause your tests to examine the app and troubleshoot errors.

## Community-driven

### Free and Open Source

TestCafe is distributed for free under the MIT license.

### Actively maintained

The TestCafe team is quick to respond to GitHub issues and StackOverflow questions. Community suggestions shape the future of the product.

### In-house support

All TestCafe Studio Pro customers (subscribers and trial users alike) receive prompt, proactive support directly from the package maintainers.

## An Architecture Like No Other

To simulate user activity, the automation engine behind TestCafe takes over browsers and the web pages they display.

### Client-Server Architecture

TestCafe's hybrid client-server architecture lets it execute both system-level and in-browser code.

* TestCafe uses [high-level system APIs](https://github.com/DevExpress/testcafe-browser-tools) to launch and manage browsers. This is necessary to control the test execution process.
* TestCafe tests are Node.js scripts. They can launch services and applications, read and write system files, make use of your favorite libraries.
* TestCafe uses client-side automation scripts to execute in-browser actions. This is how our testing library handles asynchronous events, simulates user activity, and executes user-defined JavaScript.

Early versions of TestCafe ran entirely in the browser. A hybrid architecture allowed us to improve test stability and extend the framework's testing capabilities.

### Page Proxying

You may notice that when you run TestCafe, the URL in the browser’s address bar does not match that of your website. This happens because TestCafe runs an under-the-hood reverse proxy.

The [testcafe-hammerhead](https://github.com/DevExpress/testcafe-hammerhead) proxy intercepts browser requests and injects automation scripts into the requested pages. When the proxy receives data, it changes all the URLs on the resource so that they point to the proxy. This means that neither the client-side code nor other resources in use can tell that the page has been modified. To conceal automation scripts from the rest of the page code, TestCafe also intercepts some of the requests to the browser API.

The proxying mechanism ensures that the page appears to be hosted at the original URL even to the test code.

### Browser Sandboxing

At the end of each run, TestCafe deletes all browser cookies, empties the storage, and reloads the page, thereby preventing undesirable interference with subsequent tests. You don’t need to write boilerplate code to reset the app state and reverse the changes your tests make.

Tests that run in parallel operate in independent sandboxed environments. This helps prevent server-side collisions.

### Client-Side Scripts

TestCafe translates server-side test code into client-side JavaScript, and injects it into the browsers that it controls. This process enables the framework to perform common in-browser actions. Some testing scenarios, however, require the execution of custom client-side code. There are three ways to do it with TestCafe:

[Client Scripts](../guides/advanced-guides/inject-client-scripts.md) inject custom JavaScript files, such as temporary extra dependencies, into the page.
[Client Functions](../guides/basic-guides/obtain-client-side-info.md) evaluate user-defined JavaScript expressions and pass their return value to the server side. They are useful when you want to examine the page or access its URL.
The [Selector](../guides/basic-guides/select-page-elements.md) function can launch user-defined client-side code to find a DOM element that cannot be otherwise identified.

> The TestCafe documentation describes the limitations of user-defined client-side scripts.

## Try it for yourself

Try TestCafe for yourself and see how the features it packs can make *your* life easier. Create your first test in under 5 minutes by following our [Getting Started Guide](https://devexpress.github.io/testcafe/documentation/getting-started/).
