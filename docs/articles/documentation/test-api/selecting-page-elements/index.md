---
layout: docs
title: Selecting Page Elements
permalink: /documentation/test-api/selecting-page-elements/
checked: true
---
# Selecting Page Elements

TestCafe runs test code on the server. When you need to refer to a DOM element
to perform an action on it, you can pass CSS selectors to the appropriate [action](../actions/index.md) function.

However, there are cases when you may need direct access to DOM elements.
For instance, you need to know the state of a particular page element to make an [assertion](../assertions.md).
You may also find CSS selectors not powerful enough to identify an element on which you need to perform an action.

To address these scenarios, TestCafe introduces the *selector* functions. They are executed on the client side, while
their return value (a [DOM node snapshot](dom-node-snapshots.md)) is sent to the server where it can be used to identify a DOM node or observe its state.

* [Selectors](selectors.md)
* [Selector Options](selector-options.md)
* [DOM Node Snapshots](dom-node-snapshots.md)