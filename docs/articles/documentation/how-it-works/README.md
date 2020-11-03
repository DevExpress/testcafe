---
layout: docs
title: How It Works
permalink: /documentation/how-it-works/
---
# How Does TestCafe Work?

The automation engine behind TestCafe takes over browsers and the web pages they display to simulate user activity.

## The Server-Client Architecture

The server-client architecture of TestCafe makes it capable of executing both system-level and in-browser code.

* TestCafe uses [high-level system APIs](https://github.com/DevExpress/testcafe-browser-tools) to launch and manage browsers. This is necessary to achieve full control over test execution.
* TestCafe tests are full-fledged Node.js scripts. They can launch services and applications, read and write system files, make use of your favourite libraries.
* At the same time, TestCafe is capable of performing in-browser actions via client-side automation scripts. This is how TestCafe handles asynchronous events, simulates user activity, and executes custom (user-defined) JavaScript.

Our experience shows that this hybrid approach gives users the best of both worlds. Early versions of TestCafe ran entirely in the browser. This caused a number of issues. The tests’ capabilities were limited, the application often interfered with page execution, and the sub-optimal logic separation caused browser crashes. Since then, we decoupled the engine, exposed the underlying Node.js API, and implemented a test runner that executes test scripts server-side.

## Page Proxying: Bridging the Server-Client Gap

You may notice that when you run TestCafe, the URL in the browser’s address bar does not match that of your website. This happens because TestCafe runs an under-the-hood reverse proxy.

The [testcafe-hammerhead](https://github.com/DevExpress/testcafe-hammerhead) proxy intercepts browser requests and adds automation scripts to the requested resources. It then modifies the URLs contained within the resource so that they point to the proxy. That way, neither the client-side code nor the resources it communicates with can tell that the page has been modified. To conceal automation scripts from the rest of the page code, TestCafe mocks the browser API.

The proxying mechanism ensures that the page appears to be hosted at the original URL even to the test code. This is why you can use your website’s actual URL in tests, and pay no mind to the browser’s address bar.

## Browser Sandboxing

At the end of each run, TestCafe deletes all browser cookies, empties the storage, and reloads the page, thereby preventing undesirable interference with subsequent tests. You don’t need to write any boilerplate code to reset the app state and reverse the changes your tests make.

Tests that run in parallel operate in independent sandboxed environments. This helps prevent server-side collisions.

## Client-Side Scripts

To perform common testing tasks, TestCafe translates server-side calls to its API into client-side code. However, some scenarios require the execution of client-side code that TestCafe cannot automatically generate. That’s why the framework offers multiple ways to execute user-defined JavaScript.

[Client Scripts](/../guides/advanced-guides/inject-client-scripts.md) inject custom JavaScript files, such as temporary extra dependencies, into the page.
[Client Functions](../guides/basic-guides/obtain-client-side-info.md) evaluate user-defined JavaScript expressions and pass their return value to the server side. They are useful when you want to examine the page or access the browser’s URL.
The [Selector](../guides/basic-guides/select-page-elements.md) function can launch user-defined client-side code to find a DOM element that cannot be otherwise identified.

However, client-side injections have their limits. Client-side page modifications can disrupt internal TestCafe processes. Client Functions can not return DOM elements. The rule of thumb is to only inject client-side code when you need to pass otherwise unobtainable page data to the server.
