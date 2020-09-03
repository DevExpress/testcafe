---
layout: post
title: "Introducing Multi-window Tests (Beta)"
permalink: /media/team-blog/:title.html
isTeamBlog: true
author: Boris Kirov, Eugene Titerman
---
# Introducing Multi-window Tests (Beta)

Modern web apps often launch new browser windows to authenticate users through third-party websites or display additional interactive content.

TestCafe v1.9.0 introduces partial support for multi-window tests. You can now use client-side calls to open and close browser windows. The updated API includes additional window management methods. During the 'beta' stage, this functionality is only enabled in local instances of Chrome and Firefox. Keep in mind that this feature is not ready for use in production environments. Both the syntax and capabilities are subject to change.

<!--more-->

## Client-side window events

The TestCafe browser automation driver detects and automatically activates newly launched windows. After the content is loaded, and all asynchronous requests are resolved, the test continues in the new window. When that window is closed, TestCafe switches back to the parent window and resumes the test.

The sample code below demonstrates an OAuth login scenario. Lines `8` through `10` run in the external OAuth window.

```js
fixture('Login via <Service Name>')
    .page('https://my-page');

test('Should log in via <Service Name>', async t => {
    await t
        .click('#login-popup')

        .typeText('#username', 'username')
        .typeText('#pass', 'mySecret')
        .click('#submit')

        .expect(Selector('#user').textContent).eql('Hello %Username%!'); //Make sure we are logged in
});
```

![A scheme that illustrates automatic window switching](/testcafe/images/blog/2020-8-26-multi-window-scheme-auto-switching.svg)

You do not need to write extra code to create basic multi-window tests. When you need to arbitrarily open, close and switch between windows, use the [TestCafe API](https://devexpress.github.io/testcafe/documentation/guides/advanced-guides/multiple-browser-windows.html).

## Switch between windows

The [t.switchToPreviousWindow](https://devexpress.github.io/testcafe/documentation/reference/test-api/testcontroller/switchtopreviouswindow.html) method activates the last active window. If you only have two windows open, this method will cycle between them. This is useful in a variety of scenarios.

Imagine, for example, that you're testing a real estate listings website. You want to make sure that once a new property is added, it appears in the window with all available listings. The following test implements this scenario:

```js
fixture('Property List')
    .page('https://url.com/properties'); // Open the listings page

test('Check the property list', async t => {
    await t
        .openWindow('https://url.com/addnewproperty') // Open the 'add new property' page in a new window
        .click('#make-public') // Publish the listing

        .switchToPreviousWindow() // Go back to the listings page
        .expect(Selector('.property-list li').textContent).eql('New '); // Check if the new listing is displayed
});  
```

![A scheme that illustrates switching between windows](/testcafe/images/blog/2020-8-26-multi-window-scheme-switchtowindow-scenario.svg)

## Manage multiple windows

Test scenarios with more than two open windows require more precision. The [t.switchToWindow](https://devexpress.github.io/testcafe/documentation/reference/test-api/testcontroller/switchtowindow.html) method can activate any open browser window if you pass a window descriptor object or a predicate function with the window description.

To obtain a window descriptor, call the [t.getCurrentWindow](https://devexpress.github.io/testcafe/documentation/reference/test-api/testcontroller/getcurrentwindow.html) method or save the return value when you open a new window.

```js
const windowDesc = await t.openWindow('https://devexpress.github.io/testcafe/');
await t.switchToWindow(windowDesc);
```

The predicate function must contain a description of the window's URL or title. The URL object has the same structure as its [Node.JS counterpart](https://nodejs.org/api/url.html).

```js
await t
    .openWindow('https://devexpress.github.io/testcafe/')
    .switchToWindow(({url}) => url.pathname === '/testcafe');
```

Imagine you are debugging a task manager app. To ensure that both the task list and the notification feed are updated in real time, use the [t.switchToWindow](https://devexpress.github.io/testcafe/documentation/reference/test-api/testcontroller/switchtowindow.html) method.

```js
fixture('Tasks View')
    .page('https://url.com/add-task');  
  
test('Add a new task', async t => {  
    await t
        .openWindow('https://url.com/tasks') // Open a new window with the task list
        .openWindow('https://url.com/feed') // Open the notification feed

        .switchToWindow(({url}) => url.pathname === '/add-task') // Go back to the new task form
        .typeText('#task-description', 'Redesign the landing page by 1 Feb') // Fill in the new task form
        .click('#submit-task') // Submit the task

        .switchToWindow(({url}) => url.pathname === '/tasks') // Switch back to the task list
        .expect(Selector('.task-item').count).eql(1) // Check if the new task is displayed

        .switchToWindow(({url}) => url.pathname === 'feed') // Switch to the notification feed
        .expect(Selector('.message').textContent).eql('Redesign the landing page by 1 Feb'); // Check for the corresponding notification
});  
```

![A scheme that illustrates the task manager example](/testcafe/images/blog/2020-8-26-multi-window-scheme-task-manager.svg)

## API overview

The updated API includes a number of useful window management methods.

* [t.openWindow(url)](https://devexpress.github.io/testcafe/documentation/reference/test-api/testcontroller/openwindow.html) opens a new window and points it to the specified URL.  
* [t.getCurrentWindow()](https://devexpress.github.io/testcafe/documentation/reference/test-api/testcontroller/getcurrentwindow.html) obtains the window descriptor that corresponds to the active window.
* [t.switchToWindow(windowDescriptor)](https://devexpress.github.io/testcafe/documentation/reference/test-api/testcontroller/switchtowindow.html#tswitchtowindowwindow) activates the window that corresponds to the window descriptor.
* [t.switchToWindow(predicate)](https://devexpress.github.io/testcafe/documentation/reference/test-api/testcontroller/switchtowindow.html#tswitchtowindowpredicate) uses the predicate function to find a matching window, and activates it. The predicate can include the window's title and URL.
* [t.switchToParentWindow()](https://devexpress.github.io/testcafe/documentation/reference/test-api/testcontroller/switchtoparentwindow.html) activates the parent of the active window.
* [t.switchToPreviousWindow()](https://devexpress.github.io/testcafe/documentation/reference/test-api/testcontroller/switchtopreviouswindow.html) activates the last active window.
* [t.closeWindow()](https://devexpress.github.io/testcafe/documentation/reference/test-api/testcontroller/closewindow.html) closes the active window.
* [t.closeWindow(windowDescriptor)](https://devexpress.github.io/testcafe/documentation/reference/test-api/testcontroller/closewindow.html) closes the window that corresponds to the window descriptor.

## Try the new API and let us know what you think

To try the functionality described in this article:

* Install TestCafe version 1.9.0 or later;
* Create a test scenario that incorporates more than one browser window;
* Include the window management methods from this article in the test.

The TestCafe team is proud to create API that realistically model user behavior. If you find that the new window management capabilities can be modified to better serve your needs, please let us know. Submit your feedback and bug reports to [our GitHub repository](https://github.com/DevExpress/testcafe/issues/new/choose).

Refer to the TestCafe help topics for additional information about these methods.
