---
layout: docs
title: Selecting Page Elements
permalink: /documentation/test-api/selecting-page-elements/
checked: false
---
# Selecting Page Elements

TestCafe runs test code on the server. When you need to refer to a DOM element
to perform an action on it, you can pass CSS selectors to the appropriate [action](../actions/README.md) function.

However, there are cases when you may need direct access to DOM elements.
For instance, you need to know the state of a particular page element to make an [assertion](../assertions/README.md).
You may also find CSS selectors not powerful enough to identify an element on which you need to perform an action.

To address these scenarios, TestCafe introduces the *selector* functions.
A Selector identifies a webpage element in the test and allow to get its state and
use it in actions and assertions.

* [Selectors](selectors/README.md)
* [DOM Node State](dom-node-state.md)
* [Framework-Specific Selectors](framework-specific-selectors.md)
* [Examples of Working with DOM Elements](examples-of-working-with-dom-elements.md)
