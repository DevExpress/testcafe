---
layout: docs
title: Why TestCafe?
permalink: /documentation/why-testcafe/
---

# Why TestCafe?

TestCafe excels where other end-to-end testing solutions fall short.

## Comprehensive and easy to set up

TestCafe does not depend on Selenium or other testing software. TestCafe runs on the popular Node.js platform, and makes use of the browsers that you already have. For many users, the installation process consists of a single step:

```js
npm install -g testcafe
```

## Human-readable JavaScript tests

TestCafe is a JavaScript framework. But you don’t need to be a JavaScript guru to write TestCafe tests. The core components of our API are intuitive and only require a basic knowledge of the language.

## A first class citizen of the Node.js ecosystem

If you want to take your testing experience to the next level, you can always integrate additional JavaScript libraries and preprocessors into TestCafe tests.

## Powerful but simple

The advanced features of the TestCafe API can help you test complex, security-sensitive web applications.

### Mock Requests

Emulate HTTP responses to feed your app sample data, troubleshoot connectivity errors and cheat downtime.

### Client-side injections

Execute custom client-side code to parse the web page, examine its state, or even add extra dependencies.

### Frames and windows

Make use of multiple browser windows to test out complex user interactions. Switch to and from iframes with ease and stability.

### Concurrent tests

Run your tests in multiple browsers at once to quickly uncover browser-specific errors.

## Automate what’s possible

### Automated waiting

Manual timeouts are a thing of the past. Asynchronous from the ground-up, TestCafe knows when to wait and what to wait for before a test can continue.

### Automated authentication scripts

Save and activate user roles to easily switch between different user accounts.

### Hooks

Keep your code clean with hooks — routines that are repeated before and after each test.

## Interactive when you need it

### TestCafe Studio

Use a GUI test recorder that makes the power of TestCafe accessible to people with zero programming experience.

### Live mode

Instantly see how the changes you introduce impact the test.

### Debug mode

Pause your tests to examine the app and troubleshoot errors.

## Community-driven

### Free and Open Source

TestCafe is distributed for free under the MIT license.

### Actively maintained

The TestCafe team is quick to respond to GitHub issues and StackOverflow questions. Community suggestions shape the future of the product.

### In-house support

All TestCafe Studio Pro customers (subscribers and trial users alike) receive prompt, proactive support directly from the package maintainers.


## How Does TestCafe Work?

The automation engine behind TestCafe takes over browsers and the web pages they display to simulate user activity.

### The Server-Client Architecture

The server-client architecture of TestCafe allows it to execute system-level and in-browser code.

* TestCafe uses [high-level system APIs](https://github.com/DevExpress/testcafe-browser-tools) to launch and manage browsers. This is necessary to achieve full control over test execution.
* TestCafe tests are full-fledged Node.js scripts. They can launch services and applications, read and write system files, make use of your favourite libraries.
* At the same time, TestCafe is capable of performing in-browser actions with client-side automation scripts. This is how TestCafe handles asynchronous events, simulates user activity, and executes custom (user-defined) JavaScript.

Our experience shows that this hybrid approach gives users the best of both worlds. Early versions of TestCafe ran entirely in the browser. This caused a number of issues. The tests’ capabilities were limited, the application often interfered with page execution, and the sub-optimal logic separation caused browser crashes. Since then, we decoupled the engine, exposed the underlying Node.js API, and implemented a test runner that executes test scripts server-side.

### Page Proxying: Bridging the Server-Client Gap

You may notice that when you run TestCafe, the URL in the browser’s address bar does not match that of your website. This happens because TestCafe runs an under-the-hood reverse proxy.

The [testcafe-hammerhead](https://github.com/DevExpress/testcafe-hammerhead) proxy intercepts browser requests and adds automation scripts to the requested resources. It then modifies the URLs contained within the resource, so that they point to the proxy. This way, neither the client-side code, nor the resources it communicates with, can tell that the page has been modified. To conceal automation scripts from the rest of the page code, TestCafe mocks the browser API.

The proxying mechanism ensures that the page appears to be hosted at the original URL even to the test code. This is why you can use your website’s actual URL in tests, and pay no mind to the browser’s address bar.

### Browser Sandboxing

At the end of each run, TestCafe deletes all browser cookies, empties the storage, and reloads the page, thereby preventing undesirable interference with subsequent tests. You don’t need to write boilerplate code to reset the app state and reverse the changes your tests make.

Tests that run in parallel operate in independent sandboxed environments. This helps prevent server-side collisions.

### Client-Side Scripts

To perform common testing tasks, TestCafe translates server-side calls to its API into client-side code. However, some scenarios require the execution of client-side code that TestCafe cannot automatically generate. That’s why the framework offers multiple ways to execute user-defined JavaScript.

[Client Scripts](/../guides/advanced-guides/inject-client-scripts.md) inject custom JavaScript files, such as temporary extra dependencies, into the page.
[Client Functions](../guides/basic-guides/obtain-client-side-info.md) evaluate user-defined JavaScript expressions and pass their return value to the server side. They are useful when you want to examine the page or access the website’s URL.
The [Selector](../guides/basic-guides/select-page-elements.md) function can launch user-defined client-side code to find a DOM element that cannot be otherwise identified.

However, client-side injections have their limits. Client-side page modifications can disrupt internal TestCafe processes. Client Functions can not return DOM elements. The rule of thumb is to only inject client-side code when you need to pass otherwise unobtainable page data to the server.
